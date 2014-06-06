module.exports = {
  getHomeDir: function() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  },
  getUserName: function() {
    process.env[(process.platform == 'win32') ? 'USERNAME' : 'USER'];
  }
}
