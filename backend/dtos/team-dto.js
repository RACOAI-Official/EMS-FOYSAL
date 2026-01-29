const LeaderDto = require('./leader-dto');
class TeamDto {
    id;
    name;
    description;
    image;
    admin;
    status;
    leader;
    progress;
    progressNote;
    empire;
    isFavorite;

    constructor(team) {
        this.id = team._id;
        this.name = team.name;
        this.description = team.description;
        this.image = team.image && team.image !== 'team.png'
            ? (team.image.startsWith('http') ? team.image : `${process.env.BASE_URL}/storage/images/teams/${team.image}`)
            : '/assets/icons/team.png',
            this.admin = team.admin;
        this.status = team.status && team.status.charAt(0).toUpperCase() + team.status.slice(1);
        this.leader = team.leader && team.leader.name && new LeaderDto(team.leader);
        this.progress = typeof team.progress === 'number' ? team.progress : 0;
        this.progressNote = team.progressNote || '';
        this.empire = team.empire;
        this.isFavorite = team.isFavorite || false;
    }

}

module.exports = TeamDto;
