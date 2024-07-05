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
      'vendor/open': 'Vendor List',
      'part/open' : 'Parts List',
      'part/new' : 'New Parts',
      'vendor/new' : 'New Vendor',
      'slccall/new' : 'New SLC Call',
      'cccall/new' : 'New CC Call',
      'cccall/2': 'Update CC Call',
      'system_type/open': 'System Type List',
      'system_type/new' : 'New System Type',
      'brand/open' : 'Brand List',
      'brand/new' : 'New Brand',
      'engineer/open' : `Engineer's List`,
      'engineer/new' : 'New Engineer'






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
      'vendor/open': 'New Vendor',
      'part/open' : 'New Parts',
      'part/new' : 'New Parts',
      'vendor/new' : 'New Vendor',
      'slccall/new' : 'New SLC Call',
      'cccall/new' : 'New CC Call',
      'cccall/2': 'Update CC Call',
      'system_type/open': 'New System Type',
      'system_type/new' : 'New System Type',
      'brand/open' : 'New Brand',
      'brand/new' : 'New Brand',
      'engineer/open' : 'New Engineer',
      'engineer/new' : 'New Engineer'











      // Add more mappings as needed
    };



    
    const key = `${name}/${status}`;
    console.log('e',key)
    return headerMappings[key] || `${name} ${status}`; // Default header if no mapping found
  }




  function generateUpdateContent(name, status) {
    const headerMappings = {
      'slccall': 'Update SLC Call',
      'cccall': 'Update CC Call',
      'vendor': 'Update Vendor',
      'part' : 'Update Parts',
      'system_type' : 'Update System Type',
      'brand' : 'Update Brand'
      

      // Add more mappings as needed
    };


    
    
    const key = `${name}`;
    console.log('e',key)
    return headerMappings[key] || `${name}`; // Default header if no mapping found
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


    pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${req.params.name}'`, (err, columns) => {
        if (err) {
            throw err;
        } else {
            const columnNames = columns.map(column => column.COLUMN_NAME)
                                       .filter(name => !['status', 'created_at', 'id' , 'updated_at', 'assign_engineer', 'type'].includes(name));

            res.render('add', {
                columns: columnNames,
                name: req.params.name,
                pageHeader,
                buttonContent,
                msg:req.query.message
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




router.post('/insert',verify.adminAuthenticationToken, upload.fields([ { name: 'image', maxCount: 1 },
    { name: 'aadhar_card_image', maxCount: 1 } , {name:'pan_card_image' , maxCount : 1} , {name:'selfie' , maxCount:1} , {name:'qr_code' , maxCount:1}]), async (req, res) => {
    const { body, params, files } = req;
    // const { name } = params;

    try {
        body.created_at = verify.getCurrentDate();
        body.updated_at = verify.getCurrentDate();
        body.status = 'open'

        if (files && files['image']) {
            body.image = req.files['image'][0].filename;
        }

        if (files && files['aadhar_card_image']) {
            body.aadhar_card_image = req.files['aadhar_card_image'][0].filename;
        }


        if (files && files['pan_card_image']) {
            body.pan_card_image = req.files['pan_card_image'][0].filename;
        }

        if (files && files['selfie']) {
            body.selfie = req.files['selfie'][0].filename;
        }

        if (files && files['qr_code']) {
            body.qr_code = req.files['qr_code'][0].filename;
        }


        await queryAsync(`INSERT INTO ${req.body.type} SET ?`, body);
        res.redirect(`/admin/dashboard/new/${encodeURIComponent(req.body.type)}?message=${encodeURIComponent('Saved Successfully')}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});







router.get('/delete', verify.adminAuthenticationToken, async (req, res) => {
    const { type, id } = req.query;

    if (!type || !id) {
        return res.status(400).send('Bad Request');
    }

    // res.json(req.query)

    // console.log('query',req.query)

    try {
        const sql = `DELETE FROM ?? WHERE id = ?`;
        await queryAsync(sql, [type, id]);
        res.json({ msg: 'success' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/update/:type/:id', verify.adminAuthenticationToken, async (req, res) => {
    const {  message } = req.query;
    const { type, id } = req.params;

    if (!type || !id) {
        return res.status(400).send('Bad Request');
    }

    try {
        let pageHeader = generateUpdateContent(type, id);
        let buttonContent = generateUpdateContent(type, id,);

        // Fetch column names
        const columnQuery = 'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?';
        const columns = await queryAsync(columnQuery, [type]);
        const columnNames = columns.map(column => column.COLUMN_NAME)
                                   .filter(column => !['status', 'created_at', 'updated_at', 'assign_engineer', 'type'].includes(column));

        // Fetch the existing data for the specified id
        const dataQuery = `SELECT * FROM ?? WHERE id = ?`;
        const [data] = await queryAsync(dataQuery, [type, id]);

        res.render('update', {
            columns: columnNames,
            data,
            type,
            id,
            pageHeader,
            buttonContent,
            msg: message
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});








router.post('/update/:type', verify.adminAuthenticationToken, upload.fields([ { name: 'image', maxCount: 1 },
    { name: 'aadhar_card_image', maxCount: 1 } , {name:'pan_card_image' , maxCount : 1} , {name:'selfie' , maxCount:1} , {name:'qr_code' , maxCount:1}]), async (req, res) => {
    const { body, params, files } = req;
    const { type } = params;

    try {
        body.updated_at = verify.getCurrentDate();
        
        if (files && files['image']) {
            body.image = req.files['image'][0].filename;
        }

        if (files && files['aadhar_card_image']) {
            body.aadhar_card_image = req.files['aadhar_card_image'][0].filename;
        }


        if (files && files['pan_card_image']) {
            body.pan_card_image = req.files['pan_card_image'][0].filename;
        }


        if (files && files['selfie']) {
            body.selfie = req.files['selfie'][0].filename;
        }

        if (files && files['qr_code']) {
            body.qr_code = req.files['qr_code'][0].filename;
        }


        await queryAsync(`UPDATE ${type} SET ? WHERE id = ?`, [body, body.id]);
        res.redirect(`/admin/dashboard/update/${encodeURIComponent(type)}/${encodeURIComponent(body.id)}?message=${encodeURIComponent('Updated Successfully')}`);
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



  
router.get('/fetch/:column',(req,res)=>{
    pool.query(`select * from ${req.params.column} order by name`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
    })



    router.get('/filter',(req,res)=>{
        try {
            const filters = req.query;
            let query = `SELECT * FROM ${req.query.type} WHERE 1=1`; // Base query
    
            // Append conditions to the query based on the filters
            for (const [key, value] of Object.entries(filters)) {
                if (value && key !== 'from_date' && key !== 'to_date') {
                    query += ` AND ${key} = '${value}'`;
                }
            }


             // Append from_date and to_date conditions
        if (filters.from_date) {
            query += ` AND created_at >= '${filters.from_date}'`;
        }
        if (filters.to_date) {
            query += ` AND created_at <= '${filters.to_date}'`;
        }
    
            // Execute the query
            pool.query(query, (err, results) => {
                if (err) {
                    console.error('Error fetching filtered data:', err);
                    return res.status(500).json({ success: false, error: 'Database error' });
                }
    
                res.json({ success: true, data: results });
            });
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    })
  
  

module.exports = router;