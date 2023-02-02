// const fetch = require("node-fetch");
import fetch from "node-fetch";
// const express = require('express');
import express from "express";
// const bodyParser= require('body-parser');
import bodyParser from "body-parser";
// const mongoose = require('mongoose');
import mongoose from "mongoose";
// var cors = require('cors');
import cors from "cors"
// const morgan = require("morgan");
import morgan from "morgan";
// const { createProxyMiddleware } = require("http-proxy-middleware");
import {createProxyMiddleware} from "http-proxy-middleware"
// require("dotenv").config();
import dotenv from "dotenv";
dotenv.config();
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const app=express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cors());
mongoose.set('strictQuery', true);
mongoose.connect("Mongo_DB_URL",{useNewUrlParser:true},function(err){
    if(err){
        console.log(err.name,err.message);
    }
    else{
        console.log("mongodb connected successfully");
    }
});

const userSchema=new mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNumber: String,
    emailAddress: String
});

const User=new mongoose.model("User",userSchema);

app.post("/",(req,res)=>{
    const {first,last,phone,email}=req.body;
    const newData = new User({
        firstName: first,
        lastName: last,
        phoneNumber: phone,
        emailAddress: email
    });
    newData.save(function(err,result){
        if(!err) {
            console.log("successfully added a new article");
            res.send("successfully added new article");
        }
        else console.log(err);
    });
});
app.post("/query",async (req,res)=>{
    const text=req.body.text;
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      max_tokens: 7,
      temperature: 0,
    });
    console.log(response.data.choices[0].text);
    res.send(response.data.choices[0].text)
})
app.post("/image", async (req,res)=>{
    const imageType=req.body.image;
    const imageSize=req.body.size;
    let size;
    if(imageSize==="large"){
        size="1024x1024";
    }
    else if(imageSize==="medium"){
        size="512x512";
    }
    else{
        size="256x256";
    }
    const response = await openai.createImage({
      prompt: imageType,
      n: 1,
      size: "256x256",
    });
    console.log(response.data.data[0].url);
    res.send(response.data.data[0].url);
})
// app.post('/bot', async (req,res)=>{
//     const animalInput=req.body.animal;
//     console.log(animalInput);
//     try {
//       const response = await fetch("http://localhost:3000/api/generate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ animal: animalInput }),
//       });

//       const data = await response.json();
//       if (response.status !== 200) {
//         throw data.error || new Error(`Request failed with status ${response.status}`);
//       }
//       console.log(data.result);
//     //   setResult(data.result);
//     //   setAnimalInput("");
//     res.send(data.result)
//     } catch(error) {
//       // Consider implementing your own error handling logic here
//       console.error(error);
//     //   alert(error.message);
//     }
// })
app.get("/",(req,res)=>{
    res.send("hello world");
})
app.listen(5000,()=>{
    console.log("running");
})
