SlackTeamClient = function(authToken) {
  this.client = null;
  this.init(authToken);
}

SlackTeamClient.prototype = {
  init: function(authToken) {
    let self = this;
    this.client = new Slack(authToken, true, true); // autoReconnect = true, autoMark = true
    this.client.on('open', Meteor.bindEnvironment(() => {self.clientOnOpen()}));
    this.client.on('message', Meteor.bindEnvironment((message) => {self.clientOnMessage(message)}));
    this.client.on('error', Meteor.bindEnvironment(() => {self.clientOnError()}));
    this.client.login();
  },

  clientOnOpen: function() {
    console.log('clientOnOpen: ', this.client.team.name);
    let authToken = this.client.token;
    let teamId = this.client.team.id;
    let teamName = this.client.team.name;

    if (Meteor.settings.fetchInitial) {
      this._fetchAllChannels();
    }
    // console.log("client: ", this.client);
  }
  ,

  clientOnMessage: function(message) {
    let self = this;
    let channel = self.client.getChannelGroupOrDMByID(message.channel);
    self._fetchChannel(channel);
  },

  clientOnError: function(error) {
    console.log('clientOnError: ', error);
  },

  _insertMessage: function(message) {
    let self = this;
    if (message.type === 'message') {
      let channelId = message.channel;
      let userId = message.user;
      let channel = self.client.getChannelGroupOrDMByID(channelId);
      let channelName = channel.name;
      let userName = userId? self.client.users[userId].name: '=UNKNOWN=';
      let options = {
        teamId: self.client.team.id,
        teamName: self.client.team.name,
        channelId: channelId,
        channelName: channel.name,
        text: message.text,
        userName: userName,
        ts: message.ts
      }
      TeamChannelMessages.insertIfNotExisted(options);
    }
  },

  _fetchAllChannels: function() {
    let self = this;
    _.each(_.values(self.client.channels), function(channel) {
      if (channel.is_member) {
        self._fetchChannel(channel);
      }
    });
    _.each(_.values(self.client.dms), function(dm) {
      if (dm.is_open) {
        self._fetchChannel(dm);
      }
    });
    _.each(_.values(self.client.groups), function(group) {
      self._fetchChannel(group);
    });
  },

  _fetchChannel: function(channel) {
    let self = this;
    let selector = {
      teamId: self.client.team.id,
      channelId: channel.id
    };

    let options = {
      teamId: self.client.team.id,
      teamName: self.client.team.name,
      channelId: channel.id,
      name: channel.name,
      type: channel.getType()
    }
    TeamChannels.upsert(selector, {$set: options});

    self._fetchChannelHistory(channel);
  },

  _fetchChannelHistory: function(channel) {
    let self = this;
    let method = 'channels.history';
    if (channel.getType() === 'Group') {
      method = 'groups.history';
    } else if (channel.getType() === 'DM') {
      method = 'im.history';
    }

    let teamId = self.client.team.id;
    let channelId = channel.id;
    let teamChannel = TeamChannels.findOne({teamId: teamId, channelId: channelId});
    if (!teamChannel) {
      console.log("[SlackTeamClient] _fetchChannelHistory TeamChannel not found: ", teamId, channelId);
      return;
    }

    let params = {channel: channelId};
    if (Meteor.settings.fetchMax) {
      _.extend(params, {count: Meteor.settings.fetchMax});
    }
    if (teamChannel.lastMessageTS) {
      _.extend(params, {oldest: teamChannel.lastMessageTS});
    }

    console.log("[SlackTeamClient] fetching messages: ", JSON.stringify(params));
    self.client._apiCall(method, params, Meteor.bindEnvironment(function(result) {
      if (!result.ok) {
        console.log("[SlackTeamClient] fetch failed: ", result);
      }
      console.log("[SlackTeamClient] inserting messages: ", result.messages.length);
      _.each(result.messages, function(message) {
        _.extend(message, {teamId: teamId, channel: channelId});
        self._insertMessage(message);
      });
    }));
  }
}
