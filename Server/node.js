const express=require("express");
const fs=require("fs");
const {MongoClient} = require('mongodb');
const nodemailer=require('nodemailer');
const bcrypt=require('bcrypt');
const path = require("path");
const app=express();
var user1;
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.get('/login',function(req,res)
{
    res.sendfile(path.join(__dirname,'Login','loginpage.html'));
});
app.post('/login',async function(req,res){
    const lname=req.body.lName;
    const lpass1=req.body.lPass;
    const con="mongodb://localhost:27017/";
    const client=new MongoClient(con);
    try
    {
        await client.connect();
        const database=client.db("user_data");
        const data=database.collection("data");
        const user = await data.findOne({$or:[{ rname: lname }, { remail: lname }] });
        const hp = await bcrypt.hash(lpass1, 10);
        if(user && (await bcrypt.compare(lpass1, user.rpass1)||lpass1===user.rpass1))
        {
            console.log("Login successfull");
            user1=user.rname;
            fs.writeFile("D:\\Music_clone\\music123.txt",user.rname,err=>{
                if(err)
                {
                    console.log(err);
                }
            });
            res.redirect("http://localhost:3000");
            //res.send("Welcome "+user.rname);
        }
        else
        {
            res.send("Invalid username or password");
            console.log("Invalid username or password");
        }
    }
    catch(error)
    {
        console.log(error);
    }
    finally
    {
        await client.close();
    }
});
app.get('/register',function(req,res){
    res.sendfile(path.join(__dirname,'Register','registerpage.html'));
})
app.post('/register',async function(req,res){
    var rname=req.body.rname;
    var rpass1=req.body.rpass1;
    var rpass2=req.body.rpass2;
    var remail=req.body.remail;
    const con="mongodb://localhost:27017/";
    const client=new MongoClient(con);
    const database=client.db("user_data");
    const data=database.collection("data");
    const user = await data.findOne({$or:[{rname:rname},{remail:remail}] });
    if(!user)
    {
        try
        {
            if(rname && rpass1 && rpass2 && remail)
            {
                if(rpass1===rpass2)
                {
                    const hashedPassword = await bcrypt.hash(rpass1, 10);
                    var info={
                        rname:rname,
                        rpass1:hashedPassword,
                        remail:remail
                    };
                }
                var result=await data.insertOne(info);
                console.log("Inserted successfully");
                res.send("Registered Successfully");
            }
        }
        catch(error)
        {
            console.log(error);
        }
        finally
        {
            await client.close();
        }
    }
    else
    {
        console.log("User aldready registered");
    }
});
app.get('/forgot_password',function(req,res){
    res.sendfile(path.join(__dirname,'forgot_password','pass.html'));
});
app.post('/forgot_password',async function(req,res){
    const con="mongodb://localhost:27017/";
    const client=new MongoClient(con);
    const database=client.db("user_data");
    const data=database.collection("data");
    try
    {
        await client.connect();
        const ans=req.body.fp;
        const user=await data.findOne({remail:ans});
        if(user)
        {
            const transporter = nodemailer.createTransport
            ({
                service:'gmail',
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // Use `true` for port 465, `false` for all other ports
                auth: {
                    user: "edtech.rohan.vicky@gmail.com",
                    pass: "phbv dkth hihh uqcw",
            },
            });
            const info = await transporter.sendMail({
                from:"edtech.rohan.vicky@gmail.com", // sender address
                to:ans, // list of receivers
                subject: "Retrieved password", // Subject line
                text: `Your password is: ${user.rpass1}`,
                html: `<p>Your password is: <b>${user.rpass1}</b></p>`,
            });
            console.log("Message sent: %s", info.messageId);
        res.send("Password sent to your email");
        }
        else
        {
            console.log("email not found");
        }
    }
    catch(error)
    {
        console.log(error);
    }
    finally
    {
        await client.close();
    }
});
app.listen(1000);