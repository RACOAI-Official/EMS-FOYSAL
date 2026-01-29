const teamService = require('../services/team-service');
const ErrorHandler = require('../utils/error-handler');
const TeamDto = require('../dtos/team-dto');
const userService = require('../services/user-service');
const mongoose = require('mongoose');
const UserDto = require('../dtos/user-dto');
const fileService = require('../services/file-service');

class TeamController {

    createTeam = async (req, res, next) => {
        const image = req.file && req.file.path;
        const { name, description } = req.body;
        if (!name) return next(ErrorHandler.badRequest('Required Parameter Teams Name Is Empty'))
        const team = {
            name,
            description,
            image
        }
        const teamResp = await teamService.createTeam(team);
        if (!teamResp) return next(ErrorHandler.serverError('Failed To Create The Team'));
        res.json({ success: true, message: 'Team Has Been Created', team: new TeamDto(teamResp) });
    }

    updateTeam = async (req, res, next) => {
        const { id } = req.params;
        if (!id) return next(ErrorHandler.badRequest('Team Id Is Missing'));
        if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid Team Id'));
        let { name, description, status, leader } = req.body;
        const image = req.file && req.file.path;
        status = status && status.toLowerCase();
        if (leader && !mongoose.Types.ObjectId.isValid(leader)) return next(ErrorHandler.badRequest('Invalid Leader Id'));

        const team = {
            name,
            description,
            status,
            leader,
            isFavorite: req.body.isFavorite === 'true' || req.body.isFavorite === true
        };

        if (req.body.progress !== undefined) {
            team.progress = Number(req.body.progress);
        }
        if (req.body.progressNote !== undefined) {
            team.progressNote = req.body.progressNote;
        }

        // Only update image if a new file was uploaded
        if (image) {
            team.image = image;
        }

        console.log('Update team data:', team);
        const teamResp = await teamService.updateTeam(id, team);
        return (teamResp.modifiedCount != 1) ? next(ErrorHandler.serverError('Failed To Update Team')) : res.json({ success: true, message: 'Team Updated' })
    }

    updateTeamProgress = async (req, res, next) => {
        try {
            const { id } = req.params;
            let { progress, progressNote } = req.body;
            if (!id) return next(ErrorHandler.badRequest('Team Id Is Missing'));
            if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid Team Id'));

            // Validate progress
            if (progress === undefined || progress === null) return next(ErrorHandler.badRequest('Progress value is required'));
            progress = Number(progress);
            if (Number.isNaN(progress) || progress < 0 || progress > 100) return next(ErrorHandler.badRequest('Progress must be a number between 0 and 100'));

            const update = { progress };
            if (typeof progressNote === 'string') update.progressNote = progressNote;

            const result = await teamService.updateTeam(id, update);
            return (result.modifiedCount !== 1)
                ? next(ErrorHandler.serverError('Failed To Update Team Progress'))
                : res.json({ success: true, message: 'Team progress updated' });
        } catch (error) {
            return next(ErrorHandler.serverError(error.message));
        }
    }

    addMember = async (req, res, next) => {
        try {
            console.log('=== ADD MEMBER REQUEST ===');
            console.log('Body:', req.body);
            const { teamId, userId } = req.body;
            if (!teamId || !userId) return next(ErrorHandler.badRequest('All Fields Required'));
            if (!mongoose.Types.ObjectId.isValid(teamId)) return next(ErrorHandler.badRequest('Invalid Team Id'));
            if (!mongoose.Types.ObjectId.isValid(userId)) return next(ErrorHandler.badRequest('Invalid Employee Id'));

            console.log('Finding user:', userId);
            const user = await userService.findUser({ _id: userId });
            console.log('User found:', user ? user.name : 'NOT FOUND');
            console.log('User team:', user ? user.team : 'N/A');

            if (!user) return next(ErrorHandler.notFound('No Employee Found'));
            if (user.type != 'employee' && user.type != 'leader') return next(ErrorHandler.badRequest(`${user.name} is not an employee or leader`));

            // Check if user is already in this team
            if (user.team && user.team.length > 0) {
                console.log('Checking if user is in team...');
                const isInTeam = user.team.some(t => {
                    const teamIdStr = t._id ? t._id.toString() : t.toString();
                    console.log('Comparing:', teamIdStr, 'with', teamId);
                    return teamIdStr === teamId;
                });
                if (isInTeam) {
                    console.log('User already in team');
                    return next(ErrorHandler.badRequest(`${user.name} is already in this team`));
                }
            }

            // Add team to user's team array using $addToSet to avoid duplicates
            console.log('Adding team to user...');
            const result = await userService.UserModel.updateOne(
                { _id: userId },
                { $addToSet: { team: teamId } }
            );
            console.log('Update result:', result);

            return (!result || result.modifiedCount === 0)
                ? next(ErrorHandler.serverError(`Failed To Add ${user.name} to team`))
                : res.json({ success: true, message: `Successfully added ${user.name} to team` });
        } catch (error) {
            console.error('=== ADD MEMBER ERROR ===');
            console.error(error);
            next(error);
        }
    }

    removeMember = async (req, res, next) => {
        try {
            const { userId, teamId } = req.body;
            if (!userId || !teamId) return next(ErrorHandler.badRequest('All Fields Required'));
            if (!mongoose.Types.ObjectId.isValid(userId)) return next(ErrorHandler.badRequest('Invalid Employee Id'));
            if (!mongoose.Types.ObjectId.isValid(teamId)) return next(ErrorHandler.badRequest('Invalid Team Id'));
            const user = await userService.findUser({ _id: userId });
            if (!user) return next(ErrorHandler.notFound('No Employee Found'));
            if (user.type != 'employee' && user.type != 'leader') return next(ErrorHandler.badRequest(`${user.name} is not an employee or leader`));

            // Check if user is in this team
            if (!user.team || user.team.length === 0) {
                return next(ErrorHandler.badRequest(`${user.name} is not in any team`));
            }

            const isInTeam = user.team.some(t => {
                const teamIdStr = t._id ? t._id.toString() : t.toString();
                return teamIdStr === teamId;
            });

            if (!isInTeam) {
                return next(ErrorHandler.badRequest(`${user.name} is not in this team`));
            }

            // Remove team from user's team array
            const result = await userService.UserModel.updateOne(
                { _id: userId },
                { $pull: { team: teamId } }
            );

            return (!result || result.modifiedCount === 0)
                ? next(ErrorHandler.serverError(`Failed To Remove ${user.name} from team`))
                : res.json({ success: true, message: `Successfully removed ${user.name} from team` });
        } catch (error) {
            next(error);
        }
    }

    addRemoveLeader = async (req, res, next) => {
        const { userId: id, teamId } = req.body;
        const type = req.path.split('/').pop();
        if (!teamId || !id) return next(ErrorHandler.badRequest('All Fields Required'));
        if (!mongoose.Types.ObjectId.isValid(teamId)) return next(ErrorHandler.badRequest('Invalid Team Id'));
        if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid Leader Id'));
        const user = await userService.findUser({ _id: id });
        if (!user) return next(ErrorHandler.notFound('No Leader Found'));
        if (user.type !== 'leader') return next(ErrorHandler.badRequest(`${user.name} is not a Leader`));

        // Removed restriction that prevents leading multiple teams
        const update = await teamService.updateTeam(teamId, { leader: type === 'add' ? id : null });
        console.log(type === 'add' ? id : null);
        return update.modifiedCount !== 1 ? next(ErrorHandler.serverError(`Failed To ${type.charAt(0).toUpperCase() + type.slice(1)} Leader`)) : res.json({ success: true, message: `${type === 'add' ? 'Added' : 'Removed'} Successfully ${user.name} As A Leader` })
    }

    getTeams = async (req, res, next) => {
        const teams = await teamService.findTeams({});
        if (!teams) return next(ErrorHandler.notFound('No Team Found'));

        const data = await Promise.all(teams.map(async (o) => {
            const dto = new TeamDto(o);
            const count = await userService.findCount({ team: dto.id });
            dto.totalMembers = count;
            return dto;
        }));

        res.json({ success: true, message: 'Team Found', data })
    }

    getTeam = async (req, res, next) => {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid Team Id'));
        const team = await teamService.findTeam({ _id: id });
        if (!team) return next(ErrorHandler.notFound('No Team Found'));
        const data = new TeamDto(team);
        const membersCount = await userService.findCount({ team: data.id });
        const leaderCount = team.leader ? 1 : 0;
        data.information = {
            employee: membersCount,
            leader: leaderCount,
            admin: 0,
            totalTeam: membersCount + leaderCount
        };
        res.json({ success: true, message: 'Team Found', data })
    }

    getTeamMembers = async (req, res, next) => {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid Team Id'));
        const teams = await userService.findUsers({ team: id });
        if (!teams) return next(ErrorHandler.notFound('No Team Found'));
        const data = teams.map((o) => new UserDto(o));
        res.json({ success: true, message: 'Team Found', data })
    }

    getCounts = async (req, res, next) => {
        const admin = await userService.findCount({ type: { $in: ['super_admin', 'sub_admin'] } });
        const employee = await userService.findCount({ type: 'employee' });
        const leader = await userService.findCount({ type: 'leader' });
        const team = await teamService.findCount({});
        const data = {
            admin,
            employee,
            leader,
            team
        }
        res.json({ success: true, message: 'Counts Found', data })
    }

    deleteTeam = async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!id) return next(ErrorHandler.badRequest('Team Id Is Missing'));
            if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid Team Id'));

            const team = await teamService.findTeam({ _id: id });
            if (!team) return next(ErrorHandler.notFound('Team not found'));

            // Cleanup team image
            if (team.image) {
                fileService.deleteTeamImage(team.image);
            }

            // Unassign all users from this team (remove from team arrays)
            await userService.UserModel.updateMany({ team: id }, { $pull: { team: id } });

            const result = await teamService.deleteTeam(id);
            if (result.deletedCount !== 1) return next(ErrorHandler.serverError('Failed to delete team'));

            res.json({ success: true, message: 'Team deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new TeamController();
