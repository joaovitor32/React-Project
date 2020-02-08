const HttpError=require('../models/http-error')
const {validationResult} =require('express-validator');
const uuid=require('uuid/v4')
const Place = require('../models/place');
const  getCoordsForAddress=require('../utils/location');
const User = require('../models/user');
const mongoose=require('mongoose')
const fs=require('fs');

const getPlaceById=async (req,res,next)=>{
    const placeId=req.params.pid;
   
    let place;
    try{
        place =await Place.findById(placeId);
    }catch(err){
        const error = new HttpError('Something went wrong, could not find a place',500)
        return next(error);
    }

    if(!place){
        const error=new HttpError("Could not find a place for the provided Id",404);
        return next(error);
    }
    res.json({place:place})
}

const getPlacesByUserId =async (req,res,next)=>{
    const userId=req.params.uid;
    let places;
    try{
        places=await Place.find({creator:userId});
    }catch(err){
        const error=new HttpError('Fetching places failed, try again!',500);
        return next(error);
    }

    if(!places||places.length===0){
        const error=new HttpError("Could not find a place for the provided user Id",404);
        return  next(error);
    }
    res.json({ places: places.map(place => place.toObject({ getters: true })) });
}

const createPlace=async (req,res,next)=>{
   const errors= validationResult(req);
   if(!errors.isEmpty()){
       console.log(errors);
       return next(new HttpError('Invalid inputs check it',422));
   }
    const {title,description,address} =req.body;

    let coordinates;
    try{
        coordinates=await getCoordsForAddress(address);

    }catch(error){
        return error;
    }

    const createdPlace=new Place({
        title,
        description,
        address,
        image:req.file.path,
        location:coordinates,
        creator:req.userData.userId,
    })

    let user;
    try{
        user=await User.findById(req.userData.userId);
    }catch(err){
        const error = new HttpError('Creating place failed, please try again',500);
        return next(error);
    }
    if(!user){
        const error = new HttpError('Could not find user for the provided id',404);
        return next(error);
    }
    try{
        
        const sess=await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session:sess});
        user.places.push(createdPlace);
        await user.save({session:sess});
        await sess.commitTransaction();

    }catch(err){
        const error = new HttpError(
            'Creating place failed, try again.',500
        );
        return next(error);
    }
   
    res.status(201).json({place:createdPlace});
}

const deletePlace=async (req,res,next)=>{
    const placeId=req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
      } catch (err) {
        const error = new HttpError(
          'Something went wrong, could not delete place.',
          500
        );
        return next(error);
      }
    if(!place){
        const error=new HttpError('Could not find place for this id',404);
        return next(error);
    }

    if(place.creator.id!==req.userData.userId){
        const error= new HttpError('You are not allowed',500);
        return next(error);
     }

    const imagePath=place.image;

    try{
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await place.remove({session:sess});
      place.creator.places.pull(place);
      await place.creator.save({session:sess});
      await sess.commitTransaction();

    }catch(err){
        const error= new HttpError('Something went wrong, could not delete',500);
        return next(error);
    }
    try{
        await place.remove();
    }catch(err){
        return next(error);
    }
    fs.unlink(imagePath,err=>{
        console.log(err);
    });
    res.status(200).json({message:"Deleted place"});
}

const updatePlace=async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed check it - Update',422));
    }

    const {title,description}=req.body;
    const placeId=req.params.pid;

    let place;
    try{
        place=await Place.findById(placeId);
    }catch(err){
        const error = new HttpError("Something went wrong, could not update place.",500);
        return next(error);
    }

    place.title=title;
    place.description=description;
    
    if(place.creator.toString()!==req.userData.userId){
        const error = new HttpError("You are not allowed.",401);
        return next(error);
    }

    try{
        await place.save();
    }catch(err){
        const error=new HttpError('Something went wrong, could not update place.',500);
        return next(error);
    }

    res.status(200).json({place:place.toObject({getters:true})})
}

exports.getPlaceById=getPlaceById;
exports.getPlacesByUserId=getPlacesByUserId;
exports.createPlace=createPlace;
exports.deletePlace=deletePlace;
exports.updatePlace=updatePlace;
