const axios = require('axios');

const HttpError=require('../models/http-error');

//const API_KEY="AIzaSyDgLmMpKCzveJf1_yuA0fUzzhy0WRChvZA";

async function getCoordsForAddress(Address){
   /* 
   const response=await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        Address
        )}&key=${API_KEY}`
    )
    const data= response.data;

    if(!data||data.status=="ZERO_RESULTS"){
        const error= new HttpError('Could not find location for the especified addres 422');
        throw error;
    }
    const coordinates=data.results[0].geometry.location;
    return coordinates;*/
    return {
        lat: 40.7484474,
        lng: -73.9871516
    };
}   
module.exports=getCoordsForAddress;