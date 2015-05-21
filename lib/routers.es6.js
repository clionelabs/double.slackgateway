Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'home',
  waitOn() {
    return Meteor.subscribe("teams");
  },
  data() {
    return {
      teams: Teams.find()
    }
  },
  action() {
    this.render('main');
  }
});

Router.route('channel/:channelId', {
  name: 'channel',
  waitOn() {
    return Meteor.subscribe("teamChannel", this.params.channelId);
  },
  data() {
    return {
      channel: TeamChannels.findOne({channelId: this.params.channelId})
    }
  },
  action() {
    this.render('channel');
  }
});
