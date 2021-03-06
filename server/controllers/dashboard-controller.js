'use strict';

var User  = require('../models/user');


exports.getDefault = function(req, res, next){

  var form       = {},
      error      = null,
      formFlash  = req.flash('form'),
      errorFlash = req.flash('error');

  if (formFlash.length) {
    form.email = formFlash[0].email;
  }
  
  if (errorFlash.length) {
    error = errorFlash[0];
  }
// plans = User.getPlans()

  // console.log( req.user.stripe.plan )

  const renderObject = {
      user: req.user, 
    form: form, 
    error: error, 
    plans: User.getPlans()
      // messages: req.flash('messages')
  };

  res.render(req.render, renderObject);

};


exports.getBilling = function(req, res, next){

  var form       = {},
      error      = null,
      formFlash  = req.flash('form'),
      errorFlash = req.flash('error');

  if (formFlash.length) {
    form.email   = formFlash[0].email;
  }

  if (errorFlash.length) {
    error = errorFlash[0];
  }

  const renderObject = {
    user: req.user,
    // domain : req.user.profile.domain || '',
    form: form,
    error: error,
    // plans: plans
  };
  
  res.render(req.render, renderObject);

};

//profile
exports.getProfile = function (req, res, next){

  var form       = {},
      error      = null,
      formFlash  = req.flash('form'),
      errorFlash = req.flash('error');


  if (formFlash.length) {
    form.email = formFlash[0].email;
  }

  if (errorFlash.length) {
    error = errorFlash[0];
  }

  const renderObject = {
    user: req.user,
    //email
    placeholder: '',
    value: req.user.email,

    //forward email
    // forwardEmail: req.user.profile.forwardEmail,

    // domain: req.user.profile.domain,

    form: form,
    error: error,
    // plans: plans //@TODO check plans info. can boost an error
  };

  res.render(req.render, renderObject);
  
};


//update profile form
exports.getProfileForm = function (req, res, next){

  var form       = {},
      error      = null,
      formFlash  = req.flash('form'),
      errorFlash = req.flash('error');


  if (formFlash.length) {
    form.email = formFlash[0].email;
  }

  if (errorFlash.length) {
    error = errorFlash[0];
  }

  const renderObject = {
    user: req.user,
    //email
    placeholder: '',
    // value: req.user.email,

    //forward email
    // forwardEmail: req.user.profile.forwardEmail,

    // domain: req.user.profile.domain,

    form: form,
    error: error,
    // plans: plans //@TODO check plans info. can boost an error
  };

  res.render(req.render, renderObject);
  
};

// Updates generic profile information
exports.postProfile = function (req, res, next){

  req.assert('email',        'Email is not valid').isEmail();
  req.assert('first_name',   'First Name is required').notEmpty(); 
  req.assert('last_name',    'Last Name is required').notEmpty();  
  req.assert('company_name', 'Company Name is required').notEmpty();
  // req.assert('phone',        'Name is required').notEmpty();
  //fax field is not required field

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(req.redirect.failure);
  }

  var userAdditionalData = {


    first_name   : req.body.first_name   || '',

    last_name    : req.body.last_name    || '',

    company_name : req.body.company_name || '', 

    // phone        : req.body.phone        || '',

  };

  var query  = { _id : req.user.id };
  var update = {$set:{ 
    email  : req.body.email || '', 
    profile: userAdditionalData 


  }} ;


  if(req.body.email != req.user.email){

    User.findOne({ email: req.body.email }, function(err, existingUser) {

      if (existingUser) {
        req.flash('errors', { msg: 'An account with that email address already exists.' });
        return res.redirect(req.redirect.failure);

      } else {



        
        User.findOneAndUpdate( query, update, {new: true}, function(err, user){
          if (err) return next(err);

          console.log(user);

          user.updateStripeEmail(function(err){

            if (err) return next(err);
            req.flash('success', { msg: 'Profile information updated.' });
            res.redirect(req.redirect.success);

          });

        });

        

      }
    });

  } else {



      User.findOneAndUpdate( query, update, {new: true}, function(err, user){
        if (err) return next(err);

        console.log(user);

        user.updateStripeEmail(function(err){

          if (err) return next(err);
          req.flash('success', { msg: 'Profile information updated.' });
          res.redirect(req.redirect.success);

        });

      });



  }

};


// Adds or updates a users card.
// Maybe we can simplify this controller.
// Because a lot of things will be handled by stripe server side
// we need only get error messages if we'll have it and display.
// if request goes well - we just update our database row.

exports.postBilling = function(req, res, next){

  var stripeToken = req.body.stripeToken;

  console.log( req.body );

  // if(!stripeToken){
  //   req.flash('errors', { msg: 'Please provide a valid card.' });
  //   return res.redirect(req.redirect.failure);
  // }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    console.log( user );

    // user.setCard(stripeToken, function (err) {
    //   if (err) {
    //     if(err.code && err.code == 'card_declined'){
    //       req.flash('errors', { msg: 'Your card was declined. Please provide a valid card.' });
    //       return res.redirect(req.redirect.failure);
    //     }
    //     req.flash('errors', { msg: 'An unexpected error occurred.' });
    //     return res.redirect(req.redirect.failure);
    //   }
    //   req.flash('success', { msg: 'Billing has been updated.' });
    //   res.redirect(req.redirect.success);
    // });

  });

};

exports.getSwitchAccountPage = function (req, res, next){

  var form       = {},
      error      = null,
      formFlash  = req.flash('form'),
      errorFlash = req.flash('error');

  if (formFlash.length) {
    form.email = formFlash[0].email;
  }

  if (errorFlash.length) {
    error = errorFlash[0];
  }

  const renderObject = {

    user: req.user,
    

    form: form,
    error: error,
    // plans: plans //@TODO check plans info. can boost an error
  };

  res.render(req.render, renderObject);


};

//duplicated from post plan page. @TODO add a similar to previous billing version - when user can switch from free plan to payed plan by adding credit card information and subscribe on Stripe

exports.switchSubscriptionPlan = function (req, res, next){
  
  var subscription_id = req.body.subscription_id;

  var plan = user.getPlanBySubscriptionId( subscription_id );

  console.log( plan );

// stripeToken
  // user.setPlan(plan, stripeToken, function (err) {
//   var msg;

//   if (err) {
//     if(err.code && err.code == 'card_declined'){
//       msg = 'Your card was declined. Please provide a valid card.';
//     } else if(err && err.message) {
//       msg = err.message;
//     } else {
//       msg = 'An unexpected error occurred.';
//     }

//     req.flash('errors', {
//      msg:  msg
//    });
//     return res.redirect(req.redirect.failure);
//   }
//   req.flash('success', { 
//     msg: 'Plan has been updated.' 
//   });
//   res.redirect(req.redirect.success);
// });
  

};

exports.getUpdateCardPage = function(req, res, next){

  var form       = {},
      error      = null,
      formFlash  = req.flash('form'),
      errorFlash = req.flash('error');

  if (formFlash.length) {
    form.email   = formFlash[0].email;
  }

  if (errorFlash.length) {
    error = errorFlash[0];
  }
  
  const renderObject = {
    // user : req.user,
    // domain : req.user.profile.domain || '',
    cardholder_name : req.user.profile.last_name + ' ' + req.user.profile.first_name,
    phone : req.user.profile.phone, 
    form  : form,
    error : error,
    // plans: plans
  };
  
  res.render(req.render, renderObject);

};

//postUpdateCard