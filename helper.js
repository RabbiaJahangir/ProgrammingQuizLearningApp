var avatarRefs = require('./configs/avatar');

module.exports = function () {

  function generateAvatarLink(avatarName, host) {
    return "http://" + host + "/" + avatarRefs[avatarName].link;
  }

}
