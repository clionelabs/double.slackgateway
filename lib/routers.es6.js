Router.configure({
  layoutTemplate: 'layout'
});

Router.route("login", {
  onBeforeAction() {
    if (Meteor.user()) {
      Router.go("home");
    }
    this.next();
  },
  action() {
    this.render("login");
  }
});

Router.route('/', {
  name: 'home',
  onBeforeAction() {
    if (!Meteor.user()) {
      Router.go("login");
    }
    this.next();
  },
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
  onBeforeAction() {
    if (!Meteor.user()) {
      Router.go("login");
    }
    this.next();
  },
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
