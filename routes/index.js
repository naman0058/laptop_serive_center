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
router.get('/auth/instagram/callback', passport.authenticate('instagram', {
  failureRedirect: '/login'
}), (req, res) => {
  console.log('req.query',req.query.code)
  console.log('user details',req.user)
  res.redirect('/dashboard');  // Redirect to dashboard after successful login
});



router.post('/post', async (req, res) => {
    const imageUrl = req.body.imageUrl;  // The image URL to post
    const caption = req.body.caption;    // The caption of the post
    const accessToken = req.user.access_token;
  
    try {
      // Step 1: Upload media
      const uploadRes = await axios.post(
        `https://graph.instagram.com/v12.0/${req.user.instagram_id}/media`,
        {
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken
        }
      );
  
      const mediaId = uploadRes.data.id;
  
      // Step 2: Publish media
      await axios.post(
        `https://graph.instagram.com/v12.0/${req.user.instagram_id}/media_publish`,
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
