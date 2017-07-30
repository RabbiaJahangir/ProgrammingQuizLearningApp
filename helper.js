var avatarRefs = require('./configs/avatar');


function generateAvatarLink(avatarName, host) {
  return "http://" + host + "/" + avatarRefs[avatarName].link;
}

module.exports = {generateAvatarLink: generateAvatarLink};
