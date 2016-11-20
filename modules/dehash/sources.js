module.exports = {

  'xdecrypt.com': {
    method: 'get',
    url: 'http://xdecrypt.com/ajax/liste.php',
    params: {
      hash: 'x{hash}x'
    },
    regexp: '\\([\\w]{3,6}\\)=(.*) ";'
  },

  'md5.rednoize.com': {
    method: 'get',
    url: 'http://md5.rednoize.com/',
    params: {
      p: '',
      s: '{type}',
      q: '{hash}'
    },
    regexp: '^(.*)$'
  },

  'md5crack.com': {
    method: 'post',
    url: 'http://md5crack.com/crackmd5.php',
    params: {
      crackbtn: 'Crack that hash baby!',
      term: '{hash}'
    },
    regexp: 'Found: [a-f0-9]+ = [a-z0-9]+\\("(.*)"\\)'
  },

  'md5decryption.com': {
    method: 'post',
    url: 'http://md5decryption.com',
    params: {
      hash: '{hash}',
      submit: 'Decrypt It!'
    },
    regexp: 'Decrypted Text: </b>([^<]+)<'
  },

  'tmto.org only md5 (base64 of the result)': {
    method: 'get',
    url: 'http://www.tmto.org/api/latest/',
    params: {
      hash: '{hash}',
      auth: 'true'
    },
    regexp: ' text="(.*)"'
  },

  'tmto.org no md5 (base64 of the result)': {
    method: 'get',
    url: 'http://www.tmto.org/api/v7.0/index.php',
    params: {
      hash: '{hash}',
      auth: 'true'
    },
    regexp: ' text="(.*)"'
  },

  'md5.noisette.ch': {
    method: 'get',
    url: 'http://md5.noisette.ch/index.php',
    params: {
      hash: '{hash}'
    },
    regexp: 'String to hash : <input name="text" value="(.*)"'
  },

  // anti csrf 
  /*'c0llision.net': {
  	method: 'get',
  	url: 'http://www.c0llision.net/webcrack/request',
  	params: {
  		hash: '{hash}'
  	},
  	regexp: 'String to hash : <input name="text" value="(.*)"'
  }*/

  //http://www.cmd5.org/ tiene 7,800,000,000,000 supuestamente ... hay que romperlo

  'md5.thekaine.de': {
    method: 'get',
    url: 'http://md5.thekaine.de/',
    params: {
      hash: '{hash}'
    },
    regexp: '<td colspan="2"><br><br><b>(.*)</b></td><td></td>'
  },

  'md5pass.info': {
    method: 'post',
    url: 'http://md5pass.info/',
    params: {
      get_pass: 'Get Pass',
      hash: '{hash}'
    },
    regexp: 'Password - <b>(.*)</b> '
  },

};