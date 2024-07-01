var express = require('express');
var router = express.Router();
var pool = require('./pool');
const util = require('util');
const queryAsync = util.promisify(pool.query).bind(pool);
var verify = require('./verify');
const upload = require('./multer');
var folder = 'outlet/filters'
var isimage = ['outlet']
var databasetable = 'outlet'


// Function to generate dynamic page headers
function generatePageHeader(name, status) {
    const headerMappings = {
      'slccall/open': 'SLC OPEN Call',
      'slccall/closed': 'SLC Closed Call',
      'cccall/open': 'CC OPEN Call',
      'cccall/closed': 'CC Closed Call',
      'vendor/all': 'Vendor List',
      'part/all' : 'Parts List',
      'part/new' : 'New Parts',
      'vendor/new' : 'New Vendor',
      'slccall/new' : 'New SLC Call',
      'cccall/new' : 'New CC Call',




      // Add more mappings as needed
    };
    
    const key = `${name}/${status}`;
    return headerMappings[key] || `${name} ${status}`; // Default header if no mapping found
  }



  function generateButtonContent(name, status) {
    const headerMappings = {
      'slccall/open': 'New SLC Call',
      'slccall/closed': 'New SLC Call',
      'cccall/open': 'New CC Call',
      'cccall/closed': 'New CC Call',
      'vendor/all': 'New Vendor',
      'part/all' : 'New Parts',
      'part/new' : 'New Parts',
      'vendor/new' : 'New Vendor',
      'slccall/new' : 'New SLC Call',
      'cccall/new' : 'New CC Call',




      // Add more mappings as needed
    };
    
    const key = `${name}/${status}`;
    return headerMappings[key] || `${name} ${status}`; // Default header if no mapping found
  }


router.get('/list/:name/:status',verify.adminAuthenticationToken, (req, res) => {

    let pageHeader = generatePageHeader(req.params.name, req.params.status);
    let buttonContent = generateButtonContent(req.params.name, req.params.status);

    pool.query(`SELECT * FROM ${req.params.name} WHERE status = '${req.params.status}' order by id desc`, (err, result) => {
        if (err) {
            throw err;
        } else {
            // res.json({ result, isImage });
            res.render(`list`,{result,name:req.params.name,status:req.params.status,pageHeader,buttonContent})
            // res.json(result)
        }
    });
});



router.get('/new/:name', verify.adminAuthenticationToken, (req, res) => {
    let pageHeader = generatePageHeader(req.params.name, 'new');
    let buttonContent = generateButtonContent(req.params.name, 'new');

    console.log('opa',pageHeader)

    pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${req.params.name}'`, (err, columns) => {
        if (err) {
            throw err;
        } else {
            const columnNames = columns.map(column => column.COLUMN_NAME)
                                       .filter(name => !['status', 'created_at', 'id'].includes(name));

            res.render('add', {
                columns: columnNames,
                name: req.params.name,
                pageHeader,
                buttonContent
            });
        }
    });
});


// router.get('/management/:name', verify.adminAuthenticationToken, (req, res) => {
//     const paramName = req.params.name;
//     const response = { name: paramName };
    
//     if (isimage.includes(paramName)) {
//         response.isimage = true;
//     }

//     // res.json(response);
//     res.render(`${folder}/add`,{response,msg:req.query.message})
// });




router.post('/:name/insert',verify.adminAuthenticationToken, upload.single('image'), async (req, res) => {
    const { body, params, file } = req;
    const { name } = params;

    try {
        body.created_at = verify.getCurrentDate();
        body.status = true;
        body.updated_at = verify.getCurrentDate();
        if (isimage.includes(name)) {
            body.image = file.filename;
        }

        await queryAsync(`INSERT INTO ${databasetable} SET ?`, body);
        res.redirect(`/admin/dashboard/outlet/${encodeURIComponent(name)}?message=${encodeURIComponent('Saved Successfully')}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});







router.get('/:name/delete',verify.adminAuthenticationToken, async (req, res) => {
    const { id } = req.query;
    const { name } = req.params;
    const update = verify.getCurrentDate()

    try {
        await queryAsync(`UPDATE ${databasetable} SET status = false , updated_at = ? WHERE id = ?`, [update,id]);
        res.redirect(`/admin/dashboard/outlet/${encodeURIComponent(name)}/list`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});




router.get('/:name/update', verify.adminAuthenticationToken, async (req, res) => {
    const { name } = req.params;
    const { id } = req.query;

    try {
        const result = await queryAsync(`SELECT * FROM ${databasetable} WHERE id = ?`, [id]);
        const response = { name };
        if (isimage.includes(name)) {
            response.isimage = true;
        }
        res.render(`${folder}/update`, { response, msg: req.query.message, result });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});




router.post('/:name/update', verify.adminAuthenticationToken, upload.single('image'), async (req, res) => {
    const { body, params, file } = req;
    const { name } = params;

    try {
        body.updated_at = verify.getCurrentDate();
        
        if (file && file.filename) {
            body.image = file.filename;
        }

        await queryAsync(`UPDATE ${databasetable} SET ? WHERE id = ?`, [body, body.id]);
        res.redirect(`/admin/dashboard/outlet/${encodeURIComponent(name)}/update?id=${encodeURIComponent(body.id)}&message=${encodeURIComponent('Updated Successfully')}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/getData/:filter',(req,res)=>{
    pool.query(`select * from ${databasetable} where filters = '${req.params.filter}' order by name`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})



router.get('/contact/form',verify.adminAuthenticationToken,(req,res)=>{
    pool.query(`select * from contact_us order by id desc`,(err,result)=>{
        if(err) throw err;
        else res.render(`${folder}/contactlist`,{result})
        // else res.json(result)

    })
  })



  

module.exports = router;