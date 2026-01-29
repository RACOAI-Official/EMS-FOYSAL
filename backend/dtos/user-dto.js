const TeamDto = require('./team-dto');
class UserDto {
    id;
    name;
    email;
    username;
    mobile;
    image;
    type;
    address;
    status;
    team;
    progress;
    progressNote;
    empire;
    designation;
    project;
    constructor(user) {
        this.id = user._id,
            this.name = user.name,
            this.username = user.username,
            this.email = user.email,
            this.mobile = user.mobile,
            this.image = user.image && user.image !== 'user.png'
                ? (user.image.startsWith('http') ? user.image : `${process.env.BASE_URL}/storage/images/profile/${user.image}`)
                : '/assets/icons/user.png',
            this.type = user.type,
            this.address = user.address,
            this.status = user.status && user.status.charAt(0).toUpperCase() + user.status.slice(1),
            this.team = user.team && new TeamDto(Array.isArray(user.team) && user.team.length > 0 ? user.team[0] : user.team),
            this.progress = typeof user.progress === 'number' ? user.progress : 0,
            this.progressNote = user.progressNote || '',
            this.empire = user.empire,
            this.designation = user.designation,
            this.project = user.project,
            this.totalMembers = user.totalMembers || 0,
            this.createdAt = user.createdAt,
            this.fatherName = user.fatherName || 'N/A',
            this.motherName = user.motherName || 'N/A',
            this.bloodGroup = user.bloodGroup || 'N/A',
            this.employeeId = user.employeeId || 'N/A',
            this.presentAddress = user.presentAddress || 'N/A',

            this.nid = user.nid || 'N/A',
            this.position = user.position || 'Not Specified'
    }

}

module.exports = UserDto;
