/*
 * ZOINK MODEL
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
    content     : { type: String, required: true }
  , authorName  : { type: String, required: true }
  , authorPic   : { type: String, required: true }
  , createdAt   : { type: Date }
  , updatedAt   : { type: Date }
});

var ZoinkSchema = new Schema({
    user        : { type : Schema.Types.ObjectId, ref : 'User' }
  , createdAt   : { type: Date }
  , updatedAt   : { type: Date }
  , title       : { type: String, required: true, trim: true }
  , location    : String
  , startsAt    : Date
  , endsAt      : Date
  , invites     : []
  , rsvps       : [{ type : Schema.Types.ObjectId, ref : 'User' }]
  , todos       : []
  , messages    : [MessageSchema]
  , purchases   : []
  , carpools    : []
  , reqs        : []
});

MessageSchema.pre('save', function(next){
  // SET createdAt AND updatedAt
  now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

ZoinkSchema.pre('save', function(next){
  // SET createdAt AND updatedAt
  now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

var Zoink = mongoose.model('Zoink', ZoinkSchema);

module.exports = Zoink;