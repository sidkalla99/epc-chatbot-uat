const awsconfig = {
  Auth: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_3Zp84CD36',
    userPoolWebClientId: '74531ji04kja85t0d45kl8ab9c',
    oauth: {
      domain: 'https://eu-central-13zp84cd36.auth.eu-central-1.amazoncognito.com',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'https://zelo-zelestra.com/',
      redirectSignOut: 'https://zelo-zelestra.com/',
      responseType: 'code'
    }
  }
};

export default awsconfig;
