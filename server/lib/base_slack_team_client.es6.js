BaseSlackTeamClient = function(authToken) {
  this.client = null;
  this.relayChannel = null;
  this.init(authToken);
  this.relayQueue = null;
}

BaseSlackTeamClient.prototype = {
  init: function(authToken) {
    let self = this;
    this.client = new Slack(authToken, true, true); // autoReconnect = true, autoMark = true
    this.client.on('open', Meteor.bindEnvironment(() => {self.clientOnOpen()}));
    this.client.on('message', Meteor.bindEnvironment((message) => {self.clientOnMessage(message)}));
    this.client.on('error', Meteor.bindEnvironment(() => {self.clientOnError()}));
    this.client.login();
  },

  clientOnOpen: function() {
    console.log('baseClientOnOpen: ', this.client.team.name);

    // Find the relayChannel, if existed
    let self = this;
    _.each(_.values(self.client.channels), function(channel) {
      if (channel.name === Meteor.settings.baseTeamRelayChannelName) {
        self.relayChannel = channel;
      }
    });

    // If found, then start relaying messages
    if (self.relayChannel) {
      console.log("[BaseSlackTeamClient] start relaying messages to: ", self.relayChannel.name);
      this._startRelayingMessage();
    }
  },

  clientOnMessage: function(message) {
    // console.log('baseClientOnMessage');
  },

  clientOnError: function(error) {
    console.log('baseClientOnError: ', error);
  },

  /*
   * Observe inbound messages and relay them serially
   */
  _startRelayingMessage: function() {
    let self = this;

    let current = (moment().valueOf() / 1000).toString();
    TeamChannelMessages.find({relayedAt: null, channelId: {$ne: self.relayChannel.id},  ts: {$gt: current}}, {sort: {ts: 1}, limit: 1}).observe({
      slackClient: self,
      added: function(message) {
        let result = this.slackClient._relayMessage(message);
        if (result.id) {
          TeamChannelMessages.update({_id: message._id}, {$set: {relayedAt: moment().valueOf()}});
        }
      }
    });
  },

  _relayMessage: function(message) {
    let self = this;
    let relayMessage = self._buildRelayedMessage(message);
    let result = self.relayChannel.send(relayMessage);
    return result;
  },

  _buildRelayedMessage: function(message) {
    let time = moment(parseInt(message.ts) * 1000).format('MM-DD HH:mm:ss');
    let detailsURL = Router.routes.channel.url({channelId: message.channelId});
    return `[From ${message.teamName} - ${message.userName} - ${time}] \n ${message.text} \n Full Conversation: ${detailsURL}`;
  },

  _sendMessage: function(channelId, message) {
    let channel = this.client.getChannelGroupOrDMByID(channelId);
    let result = channel.send(message);
    return result;
  },
}
