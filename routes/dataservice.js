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
const moment = require('moment');
const xlsx = require('xlsx');



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
      'engineer/new' : 'New Engineer',
      'addcash/open' : 'Add Cash',
      'addcash/new' : 'Add Cash',






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
      'engineer/new' : 'New Engineer',
      'addcash/open' : 'Add Cash',
      'addcash/new' : 'Add Cash'













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

  router.get('/list/:name/:status',verify.adminAuthenticationToken,(req, res) => {
    let renderPage;

    // Determine which page to render based on `name` parameter
    if (req.params.name === 'slccall') {
        renderPage = 'slclist';
    } else if (req.params.name === 'cccall') {
        renderPage = 'cclist';
    } else {
        renderPage = 'list';
    }

    // Generate header and button content based on name and status
    let pageHeader = generatePageHeader(req.params.name, req.params.status);
    let buttonContent = generateButtonContent(req.params.name, req.params.status);

    // Define query and parameters based on the status parameter
    let query = `SELECT * FROM ${req.params.name} `;
    let queryParams = [];

    // If status is 'closed', filter by that specific status; otherwise, exclude 'closed'
    if (req.params.status === 'closed') {
        query += `WHERE status = ? `;
        queryParams.push(req.params.status);
    } else {
        query += `WHERE status != 'closed' `;
    }

    query += `ORDER BY id DESC`;

    // Execute the query with optional parameters
    pool.query(query, queryParams, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Internal Server Error");
        } else {
            // Calculate the age in days and add it to each record
            result = result.map(item => {
                const createdAt = moment(item.created_at);
                const ageInDays = moment().diff(createdAt, 'days');
                return { ...item, age: ageInDays };
            });
            // Render the appropriate page with the results
            res.render(renderPage, {
                result,
                name: req.params.name,
                status: req.params.status,
                pageHeader,
                buttonContent,
            });
        }
    });
});



router.get('/deliveryDone/:type/:id',(req,res)=>{
    pool.query(`update cccall set updated_at = ${verify.getCurrentDate()} , isdeliver = 'done' where id = '${req.params.id}'`,(err,result)=>{
        if(err) throw err;
        else res.redirect('/admin/dashboard/list/cccall/closed')
    })
})


router.get('/new/:name',verify.adminAuthenticationToken , (req, res) => {
    let pageHeader = generatePageHeader(req.params.name, 'new');
    let buttonContent = generateButtonContent(req.params.name, 'new');


    pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${req.params.name}'`, (err, columns) => {
        if (err) {
            throw err;
        } else {
            const columnNames = columns.map(column => column.COLUMN_NAME)
                                       .filter(name => !['status', 'created_at', 'id' , 'updated_at', 'assign_engineer', 'type' , 'isdeliver'].includes(name));

            res.render('add', {
                columns: columnNames,
                name: req.params.name,
                pageHeader,
                buttonContent,
                msg:req.query.message,

            });
        }
    });
});


// router.get('/management/:name',  (req, res) => {
//     const paramName = req.params.name;
//     const response = { name: paramName };
    
//     if (isimage.includes(paramName)) {
//         response.isimage = true;
//     }

//     // res.json(response);
//     res.render(`${folder}/add`,{response,msg:req.query.message})
// });




router.post('/insert', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'aadhar_card_image', maxCount: 1 },
    { name: 'pan_card_image', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'qr_code', maxCount: 1 }
]), async (req, res) => {
    const { body, files } = req;

    try {
        // Set default values
        body.created_at = verify.getCurrentDate();
        body.updated_at = verify.getCurrentDate();
        body.status = 'open';

        // Handle file uploads
        if (files && files['image']) body.image = files['image'][0].filename;
        if (files && files['aadhar_card_image']) body.aadhar_card_image = files['aadhar_card_image'][0].filename;
        if (files && files['pan_card_image']) body.pan_card_image = files['pan_card_image'][0].filename;
        if (files && files['selfie']) body.selfie = files['selfie'][0].filename;
        if (files && files['qr_code']) body.qr_code = files['qr_code'][0].filename;

        // Insert data into the specified table
        await queryAsync(`INSERT INTO ${req.body.type} SET ?`, body);

        // Additional logic for 'addcash' type
        if (req.body.type === 'addcash') {
            pool.query(`UPDATE engineer SET balance = balance + ? WHERE name = ?`, [parseInt(req.body.amount), req.body.engineer], (err) => {
                if (err) {
                    throw err;
                }
                // Redirect only after successful update
                res.redirect(`/admin/dashboard/new/${encodeURIComponent(req.body.type)}?message=${encodeURIComponent('Saved Successfully')}`);
            });
        } else {
            // Redirect for non-'addcash' types
            res.redirect(`/admin/dashboard/new/${encodeURIComponent(req.body.type)}?message=${encodeURIComponent('Saved Successfully')}`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});







router.get('/delete',verify.adminAuthenticationToken,  async (req, res) => {
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


router.get('/update/:type/:id',  async (req, res) => {
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
                                   .filter(column => !['created_at', 'updated_at', 'assign_engineer', 'type'].includes(column));

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








router.post('/update/:type',  upload.fields([ { name: 'image', maxCount: 1 },
    { name: 'aadhar_card_image', maxCount: 1 } , {name:'pan_card_image' , maxCount : 1} , {name:'selfie' , maxCount:1} , {name:'qr_code' , maxCount:1}]), async (req, res) => {
    const { body, params, files } = req;
    const { type } = params;


    if(req.body.status == 'open'){
        req.body.status = 'awaiting_onsite_visit'
    }


    console.log('body',req.body)

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



router.get('/contact/form',(req,res)=>{
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



    router.get('/fetchnumber/:number/:type',(req,res)=>{
        pool.query(`select * from ${req.params.type} where number = '${req.params.number}' limit 1`,(err,result)=>{
            if(err) throw err;
            else res.json(result)
        })
    })


    // router.get('/filter', (req, res) => {
    //     try {
    //         const filters = req.query;
    //         let query = `SELECT * FROM ${req.query.type} WHERE 1=1`; // Base query
    
    //         // Append conditions to the query based on the filters
    //         for (const [key, value] of Object.entries(filters)) {
    //             if (value && key !== 'from_date' && key !== 'to_date') {
    //                 query += ` AND ${key} = '${value}'`;
    //             }
    //         }
    
    //         // Append from_date and to_date conditions
    //         if (filters.from_date) {
    //             query += ` AND created_at >= '${filters.from_date}'`;
    //         }
    //         if (filters.to_date) {
    //             query += ` AND created_at <= '${filters.to_date}'`;
    //         }
    
    //         // Execute the query
    //         pool.query(query, (err, results) => {
    //             if (err) {
    //                 console.error('Error fetching filtered data:', err);
    //                 return res.status(500).json({ success: false, error: 'Database error' });
    //             }
    
    //             // Calculate the age in days for each record
    //             results = results.map(item => {
    //                 const createdAt = moment(item.created_at);
    //                 const ageInDays = moment().diff(createdAt, 'days');
    //                 return { ...item, age: ageInDays };
    //             });
    
    //             res.json({ success: true, data: results });
    //         });
    //     } catch (error) {
    //         console.error('Error processing request:', error);
    //         res.status(500).json({ success: false, error: 'Server error' });
    //     }
    // });



    router.get('/filter', (req, res) => {
        try {
            const filters = req.query;
            let query = `SELECT * FROM ${req.query.type} WHERE 1=1`; // Base query
    
            // Append conditions to the query based on the filters
            for (const [key, value] of Object.entries(filters)) {
                if (value && key !== 'from_date' && key !== 'to_date' && key !== 'status') {
                    query += ` AND ${key} = '${value}'`;
                }
            }
    
            // Append status condition
            if (filters.status && filters.status !== 'closed') {
                query += ` AND status != 'closed'`;
            } else if (filters.status === 'closed') {
                query += ` AND status = 'closed'`;
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
    
                // Calculate the age in days for each record
                results = results.map(item => {
                    const createdAt = moment(item.created_at);
                    const ageInDays = moment().diff(createdAt, 'days');
                    return { ...item, age: ageInDays };
                });
    
                res.json({ success: true, data: results });
            });
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });
    
    



    router.get('/cashout/filter', (req, res) => {
        try {
            const filters = req.query;
            let query = ` SELECT 
    co.*,
    s.name, 
    s.issue,
    s.created_at,
    s.sn,
    s.brand,
    s.brand_order_no,
    s.address,
    s.district,
    s.number,
    s.type,
    s.id,
    s.status,
    s.assign_engineer,
    DATEDIFF(NOW(), s.created_at) AS ageInDays
FROM 
    cashout AS co
LEFT JOIN 
    slccall AS s ON co.callid = s.id WHERE 1=1`; // Base query
    
            // Append conditions to the query based on the filters
            for (const [key, value] of Object.entries(filters)) {
                if (value && key !== 'from_date' && key !== 'to_date' && key !== 'status') {
                    query += ` AND ${key} = '${value}'`;
                }
            }
    
            // Append status condition
            if (filters.status && filters.status !== 'closed') {
                query += ` AND status != 'closed'`;
            } else if (filters.status === 'closed') {
                query += ` AND status = 'closed'`;
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
    
                // Calculate the age in days for each record
                results = results.map(item => {
                    const createdAt = moment(item.created_at);
                    const ageInDays = moment().diff(createdAt, 'days');
                    return { ...item, age: ageInDays };
                });
    
                res.json({ success: true, data: results });
            });
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });


    router.get('/bulk/upload/:type',verify.adminAuthenticationToken,(req,res)=>{
        res.render('bulkUpload',{type:req.params.type,msg:req.query.message})
    })


    router.get('/bulk/edit/:type',verify.adminAuthenticationToken,(req,res)=>{
        res.render('bulkEdit',{type:req.params.type,msg:req.query.message})
    })


    router.post('/bulk-upload/:type', upload.single('excel_file'), async (req, res) => {
        console.log('Processing bulk upload');
        
        const type = req.params.type;
        const excelFilePath = `public/images/${req.file.filename}`;
        
        try {
            const workbook = xlsx.readFile(excelFilePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(worksheet);
    
            // Preprocess data: remove 'age' field, convert keys to lowercase, and replace spaces with underscores
            const data = rawData.map(item => {
                return Object.keys(item).reduce((acc, key) => {
                    if (key.toLowerCase() !== 'age') {
                        const newKey = key.toLowerCase().replace(/\s+/g, '_');
                        acc[newKey] = item[key];
                    }
                    return acc;
                }, {});
            });
    
            // Process each row of the Excel data asynchronously
            const insertPromises = data.map(async (item) => {
                return new Promise((resolve, reject) => {
                    // Check if entry already exists based on `brand_order_no`
                    pool.query(`SELECT * FROM ${type} WHERE brand_order_no = ?`, [item.brand_order_no], (err, result) => {
                        if (err) return reject(err);
    
                        if (result.length > 0) {
                            console.log(`Order No ${item.brand_order_no} already exists, skipping insertion`);
                            resolve(null); // No action taken
                        } else {
                            // Insert the new record
                            pool.query(`INSERT INTO ${type} SET ?`, item, (err, result) => {
                                if (err) return reject(err);
                                resolve(result); // Insertion done
                            });
                        }
                    });
                });
            });
    
            // Wait for all insertions to complete
            await Promise.all(insertPromises);
    
            // res.json({ msg: 'Bulk upload completed successfully' });
            res.redirect(`/admin/dashboard/bulk/upload/${type}?message=Upload Successfull`)
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    });




    router.post('/bulk-edit/:type', upload.single('excel_file'), async (req, res) => {
        console.log('Processing bulk edit');
        
        const type = req.params.type;
        const excelFilePath = `public/images/${req.file.filename}`;
        
        try {
            const workbook = xlsx.readFile(excelFilePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(worksheet);
    
            // Preprocess data: remove 'age' field, convert keys to lowercase, and replace spaces with underscores
            const data = rawData.map(item => {
                return Object.keys(item).reduce((acc, key) => {
                    if (key.toLowerCase() !== 'age') {
                        const newKey = key.toLowerCase().replace(/\s+/g, '_');
                        acc[newKey] = item[key];
                    }
                    return acc;
                }, {});
            });
    
            // Process each row of the Excel data asynchronously
            const insertPromises = data.map(async (item) => {
                return new Promise((resolve, reject) => {
                    // Check if entry already exists based on `brand_order_no`
                    
                            // Insert the new record
                            pool.query(`update ${type} SET ? WHERE id = ?`, [item,item.id], (err, result) => {
                                if (err) return reject(err);
                                resolve(result); // Insertion done
                            });
                        
                });
            });
    
            // Wait for all insertions to complete
            await Promise.all(insertPromises);
    
            // res.json({ msg: 'Bulk upload completed successfully' });
            res.redirect(`/admin/dashboard/bulk/edit/${type}?message=Edit Successfull`)
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    });
    


    
  
    router.get('/print/:type/:id', (req, res) => {
        pool.query(`SELECT * FROM ${req.params.type} WHERE id = ?`, [req.params.id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("An error occurred while processing your request.");
            } else {
                if(req.params.type =='cccall'){
                    res.render('cccall_print', { type: req.params.type, result });

                }
                else{
                    res.render('print', { type: req.params.type, result });

                }
                // res.json(result)
            }
        });
    });
    


router.get('/partsAvailable/:type/:id', verify.adminAuthenticationToken,(req,res)=>{
    pool.query(`update ${req.params.type} set status = 'parts_available' where id = '${req.params.id}'`,(err,result)=>{
        if(err) throw err;
        else {
            res.redirect(`/admin/dashboard/list/${req.params.type}/open`)
        }
    })
})



router.get('/calllist/:type',verify.adminAuthenticationToken,(req,res)=>{

    if(req.params.type=='pending_cashout'){
        const query = `
        SELECT 
    co.*,
    s.name, 
    s.issue,
    s.created_at,
    s.sn,
    s.brand,
    s.brand_order_no,
    s.address,
    s.district,
    s.number,
    s.type,
    s.id,
    s.status,
    s.assign_engineer,
    DATEDIFF(NOW(), s.created_at) AS ageInDays
FROM 
    cashout AS co
LEFT JOIN 
    slccall AS s ON co.callid = s.id
WHERE 
        co.status = 'pending';
    `;
    pool.query(query,(err,result)=>{
        if(err) throw err;
        else res.render('pending_cashout_calls',{result})
    })
    }
    else if(req.params.type=='waiting_for_parts'){
        const query = `
       SELECT 
    main.name, 
    main.issue,
    main.created_at,
    main.sn,
    main.brand,
    main.brand_order_no,
    main.address,
    main.district,
    main.number,
    main.type,
    main.id,
    main.status,
    main.assign_engineer,
    main.ageInDays,
    callsUpdate.defectivePartsName -- This will select all columns from callsUpdate where callid matches id
FROM 
    (
        SELECT name, issue, created_at, sn, brand, brand_order_no, address, district, number, type, id, status, assign_engineer, 
               DATEDIFF(NOW(), created_at) AS ageInDays 
        FROM cccall 
        WHERE status = 'waiting_for_parts'
        
        UNION ALL
        
        SELECT name, issue, created_at, sn, brand, brand_order_no, address, district, number, type, id, status, assign_engineer, 
               DATEDIFF(NOW(), created_at) AS ageInDays 
        FROM slccall 
        WHERE status = 'waiting_for_parts'
    ) AS main
LEFT JOIN 
    callsUpdate 
ON 
    callsUpdate.callid = main.id;

    `;
    pool.query(query,(err,result)=>{
        if(err) throw err;
        else res.render('parts_calls',{result})
        // else res.json(result)
    })
    }
    
    else{
        const query = `
        SELECT name, issue,created_at,sn,brand,brand_order_no, address, district, number,type,id, status, assign_engineer, DATEDIFF(NOW(), created_at) AS ageInDays FROM cccall 
        WHERE status = 'pending_for_approval'
        UNION ALL
        SELECT name,issue,created_at,sn,brand, brand_order_no, address, district, number,type,id, status, assign_engineer, DATEDIFF(NOW(), created_at) AS ageInDays FROM slccall 
        WHERE status = 'pending_for_approval';
    `;
    pool.query(query,(err,result)=>{
        if(err) throw err;
        else res.render('pending_for_ta_calls',{result})
    })
    }

   
})


router.get('/update/:type/:id/:status',verify.adminAuthenticationToken, (req, res) => {
    const { type, id, status } = req.params;
  
    // Whitelist valid table names for security
    const allowedTypes = ["slccall", "cccall"]; // Add valid table names here
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid table type" });
    }
  
    pool.query(`UPDATE ${type} SET status = ? WHERE id = ?`, [status, id], (err, result) => {
      if (err) {
        console.error("Database update error:", err);
        return res.status(500).json({ error: "Failed to update status" });
      }
      res.redirect('/admin/dashboard/calllist/pending_for_approval');
    });
  });
  




  router.get('/availableParts/:type/:callid',verify.adminAuthenticationToken,(req,res)=>{
    var query = `select * from callsUpdate where callid = '${req.params.callid}';`
    var query1 = `select * from part where quantity > 0;`
    pool.query(query+query1,(err,result)=>{
        if(err) throw err;
        else res.render('availableParts',{result,type:req.params.type,callid:req.params.callid})
    })
  })


  router.get('/assignItem',verify.adminAuthenticationToken,(req,res)=>{
   
   pool.query(`select * from availableParts where callid = '${req.query.callid}' and partid = '${req.query.partid}' and type = '${req.query.type}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
        res.json({msg:'Already Assign'})
    }
    else{
        pool.query(`insert into availableParts(type,callid,partid,created_at) values('${req.query.type}','${req.query.callid}' , '${req.query.partid}' , '${verify.getCurrentDate()}')`,(err,result)=>{
            if(err) throw err;
            else{
                pool.query(`update ${req.query.type} set status = 'parts_available' where id = '${req.query.callid}'`,(err,result)=>{
                    if(err) throw err;
                    else {
                        pool.query(`update part set quantity = quantity-1 where id = '${req.query.partid}'`,(err,result)=>{
                            if(err) throw err;
                            else{
                                res.json({msg:'success'})
                            }
                        })
                    }
                })
            }
        })
    }
   })
  
  })

  
router.get('/updateAmount/:type/:id/:status',verify.adminAuthenticationToken, (req, res) => {
    const { type, id, status } = req.params;

    let updated_at = verify.getCurrentDate()
  
    // Whitelist valid table names for security
    const allowedTypes = ["slccall", "cccall"]; // Add valid table names here
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid table type" });
    }

    if(req.params.status == 'closed') {
  
    pool.query(`UPDATE ${type} SET status = ? WHERE id = ?`, [status, id], (err, result) => {
      if (err) {
        console.error("Database update error:", err);
        return res.status(500).json({ error: "Failed to update status" });
      }
      else{
        pool.query(`update cashout set status = 'done' , updated_at = ${updated_at} where callid = '${id}'`,(err,result)=>{
            if(err) throw err;
            else{
                pool.query(`update engineer set balance = balance - ${parseInt(req.query.amount)} where name = '${req.query.engineer}'`,(err,result)=>{
                    if(err) throw err;
                    else {
                        res.redirect('/admin/dashboard/calllist/pending_cashout');

                    }
                })
            }
        })
      }
    });
}
else{
    pool.query(`delete from cashout where callid = '${id}'`,(err,result)=>{
           if(err) throw err;
           else {
      res.redirect('/admin/dashboard/calllist/pending_cashout');
            
           }
    })
}
  });
  



  router.get('/cashout/history',verify.adminAuthenticationToken,(req,res)=>{
       const query = `
        SELECT 
    co.*,
    s.name, 
    s.issue,
    s.created_at,
    s.sn,
    s.brand,
    s.brand_order_no,
    s.address,
    s.district,
    s.number,
    s.type,
    s.id,
    s.status,
    s.assign_engineer,
    DATEDIFF(NOW(), s.created_at) AS ageInDays
FROM 
    cashout AS co
LEFT JOIN 
    slccall AS s ON co.callid = s.id
WHERE 
        co.status = 'done';
    `;
    pool.query(query,(err,result)=>{
        if(err) throw err;
        else {
        res.render('cashout_calls_history',{result})

        }
    })
  })




  router.get('/viewDetails/:type/:id',verify.adminAuthenticationToken, (req, res) => {
    var query = `SELECT * FROM ${req.params.type} WHERE id = '${req.params.id}';`
    var query1 = `select * from callsUpdate where callid = ${req.params.id} and type = '${req.params.type}' order by id desc limit 1;`
    
    pool.query(query+query1, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("An error occurred while processing your request.");
        } else {
            res.render('viewDetails', { type: req.params.type, result });
            // res.json(result)
        }
    });
});

module.exports = router;