Meteor.startup(() => {
  SlackService.startup();

  if (Meteor.settings.adminAccount) {
    let email = Meteor.settings.adminAccount.email;
    let password = Meteor.settings.adminAccount.password;

    if (!Meteor.users.findOne({emails: {$elemMatch: {address: email}}})) {
      let userId = Accounts.createUser({email: email, password: password});
    }
  }
});
