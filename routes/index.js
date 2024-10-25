var express = require('express');
var router = express.Router();
const passport = require('passport');
const axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});




// For Instagram


// Instagram login route
router.get('/auth/instagram', passport.authenticate('instagram'));

// Instagram callback route

// router.get('/auth/instagram/callback', async (req, res) => {
//   const code = req.query.code;  // Get the code from the callback request

//   if (!code) {
//     return res.status(400).send('Code not found');
//   }

//   try {
//     // Prepare the payload for the token exchange
//     const payload = {
//       client_id: '567466389076193',
//       client_secret: '458d7fd0b8df9fd3d138acc462308772',
//       grant_type: 'authorization_code',
//       redirect_uri: 'https://www.spvaig.com/auth/instagram/callback',  // This should match the one used in Step 1
//       code: code
//     };

//     // Send the POST request to exchange the code for the access token
//     const response = await axios.post('https://api.instagram.com/oauth/access_token', null, {
//       params: payload
//     });

//     const { access_token, user_id } = response.data;  // Extract access token and user ID
//     console.log('code exchange response', response.data);

//     // Redirect to /instagrampost route, passing the access token as a query parameter
//     res.redirect(`/instagrampost?access_token=${access_token}&user_id=${user_id}`);

//   } catch (error) {
//     console.error('Error exchanging code for access token:', error.response ? error.response.data : error);
//     res.status(500).send('Failed to exchange code for access token');
//   }
// });


// router.get('/auth/instagram/callback', async (req, res) => {
//   const code = req.query.code;  // Get the code from the callback request

//   if (!code) {
//     return res.status(400).send('Code not found');
//   }

//   try {
//     // Prepare the payload for the token exchange
//     const payload = new URLSearchParams();
//     payload.append('client_id', '567466389076193');
//     payload.append('client_secret', '458d7fd0b8df9fd3d138acc462308772');
//     payload.append('grant_type', 'authorization_code');
//     payload.append('redirect_uri', 'https://www.spvaig.com/auth/instagram/callback');  // Match the redirect URI used in Step 1
//     payload.append('code', code);

//     // Send the POST request to exchange the code for the access token
//     const response = await axios.post('https://api.instagram.com/oauth/access_token', payload, {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     });

//     const { access_token, user_id } = response.data;  // Extract access token and user ID
//     console.log('code exchange response', response.data);

//     // Redirect to /instagrampost route, passing the access token and user ID as query parameters
//     res.redirect(`/instagrampost?access_token=${access_token}&user_id=${user_id}`);

//   } catch (error) {
//     console.error('Error exchanging code for access token:', error.response ? error.response.data : error);
//     res.status(500).send('Failed to exchange code for access token');
//   }
// });





const INSTAGRAM_CLIENT_ID = '567466389076193';
const INSTAGRAM_CLIENT_SECRET = '458d7fd0b8df9fd3d138acc462308772';
const REDIRECT_URI = 'https://www.spvaig.com/auth/instagram/callback';

router.get('/auth/instagram/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Code not found');
  }

  try {
    // Exchange code for short-lived access token
    const payload = new URLSearchParams();
    payload.append('client_id', INSTAGRAM_CLIENT_ID);
    payload.append('client_secret', INSTAGRAM_CLIENT_SECRET);
    payload.append('grant_type', 'authorization_code');
    payload.append('redirect_uri', REDIRECT_URI);
    payload.append('code', code);

    const response = await axios.post('https://api.instagram.com/oauth/access_token', payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token , user_id } = response.data;
    console.log('Short-lived token response:', response.data);
    console.log('Long Lived Token URL',`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${response.data.access_token}`)

    // Exchange short-lived token for long-lived token
    const longLivedResponse = await axios.get(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${response.data.access_token}`
    );

    // const { access_token: longLivedToken, expires_in } = longLivedResponse.data;
    console.log('Long-lived token response:', longLivedResponse);

    // Store longLivedToken securely in a database (not shown here)
    
    // Redirect or respond with a success message
    // res.redirect(`/instagrampost?access_token=${longLivedToken}&user_id=${user_id}`);

  } catch (error) {
    console.error('Error exchanging code for access token:', error.response ? error.response.data : error);
    res.status(500).send('Failed to exchange code for access token');
  }
});



router.get('/auth/instagram/refresh_token', async (req, res) => {
  try {
    const longLivedToken = '<YOUR_STORED_LONG_LIVED_ACCESS_TOKEN>'; // Fetch the stored token from the database

    // Make the GET request to refresh the long-lived token
    const refreshResponse = await axios.get(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedToken}`
    );

    const { access_token: refreshedToken, expires_in } = refreshResponse.data;
    console.log('Refreshed token response:', refreshResponse.data);

    // Update the stored token and expiration time (not shown here)

    res.send({
      message: 'Token refreshed successfully',
      refreshedToken,
      expires_in,
    });

  } catch (error) {
    console.error('Error refreshing access token:', error.response ? error.response.data : error);
    res.status(500).send('Failed to refresh access token');
  }
});







// router.get('/instagrampost', async (req, res) => {
//     const imageUrl = 'https://e7.pngegg.com/pngimages/178/595/png-clipart-user-profile-computer-icons-login-user-avatars-monochrome-black.png';  // The image URL to post
//     const caption = 'Hi this is test';    // The caption of the post
//     const accessToken = 'AQCLuZb2MKFi4CwYweBdtsyac_mo5oaFF_cV9X9EbiZDk99II0xbGzjSko71bnA77Yr4ycaTq7kqtURAhqP2GkFkrEgHnoXQGzS4k74DXlZUiorVxeXw-bYEamf6fXa01ZEgXdjpjCQWbt3DpwxOzeMb91vejOvB05jrbG4UlHXdLysyYkSVVb_0_mvkAlAvXTgI3j3VMMfY6v99LpuZWnDYVEli8Biry2L8GgiWniXw6g#_'
  
//     try {
//       // Step 1: Upload media
//       const uploadRes = await axios.post(
//         `https://graph.instagram.com/v12.0/${req.user.instagram_id}/media`,
//         {
//           image_url: imageUrl,
//           caption: caption,
//           access_token: accessToken
//         }
//       );
  
//       const mediaId = uploadRes.data.id;
  
//       // Step 2: Publish media
//       await axios.post(
//         `https://graph.instagram.com/v12.0/${req.user.instagram_id}/media_publish`,
//         {
//           creation_id: mediaId,
//           access_token: accessToken
//         }
//       );
  
//       res.send("Posted successfully!");
  
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Error posting to Instagram");
//     }
//   });




router.get('/instagrampost', async (req, res) => {
  console.log('Instagram Post Query Data', req.query);

  const imageUrl = 'https://e7.pngegg.com/pngimages/178/595/png-clipart-user-profile-computer-icons-login-user-avatars-monochrome-black.png';
  const caption = 'Hi this is test';
  const accessToken = req.query.access_token;

  try {
    // Step 1: Upload media to create a media container
    const uploadRes = await axios.post(
      `https://graph.facebook.com/v21.0/${req.query.user_id}/media`,
      {
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken
      }
    );

    console.log('UploadRes', uploadRes.data);

    const mediaId = uploadRes.data.id;

    // Step 2: Publish media using the media container ID
    await axios.post(
      `https://graph.facebook.com/v21.0/${req.query.user_id}/media_publish`,
      {
        creation_id: mediaId,
        access_token: accessToken
      }
    );

    res.send("Posted successfully!");

  } catch (error) {
    console.error('Error posting to Instagram:', error.response ? error.response.data : error.message);
    res.status(500).send("Error posting to Instagram");
  }
});



module.exports = router;
