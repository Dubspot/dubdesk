(function() {

  return {

    defaultState: 'loading_screen',

    resources: {
      EMAIL        : 'dima.markus@dubspot.com',
      PASSWORD     : '1rZts3ycYg}P8BQ',
      API_URL      : 'http://api.dubspot.com',
      DATE_PATTERN : /^\d{4}-\d{2}-\d{2}$/
    },

    requests: {
      fetchUserByEmail: function(email) {
        console.log(this.email);
        console.log(this.password);
        return {
          url: helpers.fmt('%@/users?email=%@', this.api_url, email),
          type: 'GET',
          dataType: 'json',
          username: this.email,
          password: this.password
        };
      },
      fetchUsersEnrollmentsById: function(id) {
        return {
          url: helpers.fmt('%@/users/%@/enrollments', 'http://admin.dubspot.com', id),
          type: 'GET',
          dataType: 'json',
          username: this.email,
          password: this.password
        };
      }
    },

    events: {
      'app.activated'                  : 'init',
      'fetchUserByEmail.done'          : 'renderUserDetails',
      'fetchUserByEmail.fail'          : 'renderCreateUser',
      'fetchUsersEnrollmentsById.done' : 'renderEnrollments',
      'fetchUsersEnrollmentsById.fail' : 'fail',
      'putUserById.done'               : 'putCleanup',
      'putUserById.fail'               : 'fail',
      'postUsers.done'                 : 'postCleanup',
      'postUsers.fail'                 : 'fail',
      'click .show_enrollments'        : 'goToUserEnrollments',
      'click .back_to_start'           : 'goToUserDetails',
      'click .modal_close'             : 'closeModal',
      'hidden .my_modal'               : 'renderStartPage',
      'click .test_link'               : 'renderTestLink'
    },

    init: function() {
      this.email    = this.setting('email')    || this.resources.EMAIL;
      this.password = this.setting('password') || this.resources.PASSWORD;
      this.api_url  = this.setting('api_url')  || this.resources.API_URL;

      if (this.currentLocation() === 'user_sidebar') {
        this.ajax('fetchUserByEmail', this.user().email());
      } else {
        this.ajax('fetchUserByEmail', this.ticket().requester().email());
      }

      this.switchTo('loading_screen');
    },






    //===========================================================================//
    //                                USER DETAILS                               //
    //===========================================================================//

    goToUserDetails: function(event) {
      event.preventDefault();
      this.switchTo('show_user_details', {user: this.ds_user});
    },


    renderUserDetails: function(data) {
      this.ds_user = data;
      var userPageObj = { user: data };
      this.switchTo('show_user_details', userPageObj);
    },


    //===========================================================================//
    //                                 ENROLLMENTS                               //
    //===========================================================================//

    goToUserEnrollments: function(event) {
      event.preventDefault();
      this.switchTo('loading_screen');
      if (this.user_enrollments != null) {
        this.renderEnrollments(this.user_enrollments);
      } else {
        this.ajax('fetchUsersEnrollmentsById', this.ds_user.id);
      }
    },

    renderEnrollments: function(data) {
      console.log(data);
      if (data[0] === 'undefined') {
        services.notify('No enrollments found', 'alert');
        this.user_enrollments = null;
      }
      this.user_enrollments = data;

      var enrollmentsPageObj = {
        programs: this.user_enrollments.programs,
        courses: this.user_enrollments.courses,
        user: this.ds_user
      };
      this.switchTo('show_user_enrollments', enrollmentsPageObj);
    },


    //===========================================================================//
    //                                CREATE USER                                //
    //===========================================================================//

    renderCreateUser: function() {
      this.switchTo('create_user_page');
    },


    //===========================================================================//
    //                                   UTILITIES                               //
    //===========================================================================//

    closeModal: function(event) {
      if (typeof(event) !== 'undefined')
        event.preventDefault();
      this.$('.my_modal').modal('hide');
    },

    fail: function(data) {
      console.log(data);
      services.notify(JSON.stringify(data));
    },

  };

}());
