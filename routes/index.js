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
//       client_id: '441162705660684',
//       client_secret: '93e025dd145211f8b34581b24b6e27a4',
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
//     payload.append('client_id', '441162705660684');
//     payload.append('client_secret', '93e025dd145211f8b34581b24b6e27a4');
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





const INSTAGRAM_CLIENT_ID = '441162705660684';
const INSTAGRAM_CLIENT_SECRET = '93e025dd145211f8b34581b24b6e27a4';
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
   
    // const longLivedToken = await longlivedtoken(response.data.access_token)
    //  console.log('Long Lived Token Output',longLivedToken)
    
    // Redirect or respond with a success message
     res.redirect(`/instagrampost?access_token=${access_token}&user_id=${user_id}`);

  } catch (error) {
    console.error('Error exchanging code for access token:', error.response ? error.response.data : error);
    res.status(500).send('Failed to exchange code for access token');
  }
});


// longlivedtoken('IGQWRONVhQSWNWNkYwcWNwMnlfS2w2N2xpSEFwejUzcWVpUHZAHWnZAIUWhNX3NuQVBvYTNhMXVlRXFLQlNaSmppZAFJmQ1ZA6d3U2WExySTFrZAm5Tb3gxWV9kb3k4OE1RSWNTZAkFlX21OOGcwQ2VuUGpsS2piQ2JDaXJ0aExsbzZAhTmJkdwZDZD')

// async function longlivedtoken(shortLivedToken) {
//   if (!shortLivedToken) {
//     throw new Error('Short-lived token is required');
//   }

//   try {
//     const response = await axios.get('https://graph.instagram.com/access_token', {
//       params: {
//         grant_type: 'ig_exchange_token',
//         client_secret: '93e025dd145211f8b34581b24b6e27a4',  // Replace with your actual Instagram client secret
//         access_token: shortLivedToken
//       }
//     });

//     const { access_token: longLivedToken, expires_in } = response.data;
//     console.log('Long-lived token response:', response.data);

//     // Return the long-lived token and expiry information
//     return { longLivedToken, expires_in };

//   } catch (error) {
//     console.error('Error exchanging for long-lived access token:', error.response ? error.response.data : error.message);
//     throw new Error('Failed to exchange for long-lived access token');
//   }
// }


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
  const userId = req.query.user_id;

  // Basic validation of access token and user ID
  if (!accessToken || !userId) {
    return res.status(400).send("Access token or user ID is missing");
  }

  try {
    // Step 1: Upload media to create a media container
    const uploadRes = await axios.post(
      `https://graph.facebook.com/v21.0/${userId}/media`,
      {
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken
      }
    );

    console.log('UploadRes:', uploadRes.data);

    const mediaId = uploadRes.data.id;

    // Step 2: Publish media using the media container ID
    const publishRes = await axios.post(
      `https://graph.facebook.com/v21.0/${userId}/media_publish`,
      {
        creation_id: mediaId,
        access_token: accessToken
      }
    );

    console.log('PublishRes:', publishRes.data);
    res.send("Posted successfully!");

  } catch (error) {
    console.error('Error posting to Instagram:', error.response ? error.response.data : error.message);

    // Enhanced error handling based on the error code
    if (error.response && error.response.data.error.code === 190) {
      return res.status(401).send("Invalid or expired access token. Please re-authenticate.");
    }
    res.status(500).send("Error posting to Instagram");
  }
});


module.exports = router;
