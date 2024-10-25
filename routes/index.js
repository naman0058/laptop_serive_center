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
router.get('/auth/instagram/callback', (req, res) => {
  console.log('req.query',req.query.code)
   res.redirect(`/instagrampost?code=${req.query.code}`)
 // Redirect to dashboard after successful login
});



async function getUserId(accessToken) {
  try {
    const response = await axios.get(`https://graph.instagram.com/me`, {
      params: {
        access_token: accessToken,
        fields: 'id' // Retrieve only the user ID
      }
    });
    return response.data.id;
  } catch (error) {
    console.error('Error fetching Instagram User ID:', error);
    throw error;
  }
}


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
  const imageUrl = 'https://e7.pngegg.com/pngimages/178/595/png-clipart-user-profile-computer-icons-login-user-avatars-monochrome-black.png';
  const caption = 'Hi this is test';
  const accessToken = req.query.code;

  try {
    // Retrieve the user's Instagram ID
    const userId = await getUserId(accessToken);

    // Step 1: Upload media
    const uploadRes = await axios.post(
      `https://graph.instagram.com/v12.0/${userId}/media`,
      {
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken
      }
    );

    const mediaId = uploadRes.data.id;

    // Step 2: Publish media
    await axios.post(
      `https://graph.instagram.com/v12.0/${userId}/media_publish`,
      {
        creation_id: mediaId,
        access_token: accessToken
      }
    );

    res.send("Posted successfully!");

  } catch (error) {
    console.error(error);
    res.status(500).send("Error posting to Instagram");
  }
});


module.exports = router;
