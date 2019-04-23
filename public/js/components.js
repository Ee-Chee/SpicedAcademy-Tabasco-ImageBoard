Vue.component("image-modal", {
    template: "#template",
    //since data is the name used in components and main Vue, return function is used to avoid conflict
    data: function() {
        return {
            details: {},
            input: { comment: "", username: "", id: null },
            allcomments: [],
            open: false,
            toggleImg: true
        };
    },
    watch: {
        // this function runs whenever the specified data  CHANGES
        //mounted function is not triggered when user already on the image details page.
        urlimgid: function() {
            var temp = this;
            axios
                .get("/image/" + this.urlimgid)
                .then(function(resp) {
                    // console.log("hi :", resp.data);
                    temp.toggleImg = true;
                    temp.details = resp.data[0].rows[0]; //unwrapping :C
                    temp.allcomments = resp.data[1].rows;
                    if (temp.details === undefined) {
                        return throwErr;
                    }
                })
                .catch(function(err) {
                    temp.toggleImg = false;
                });
        }
    },
    mounted: function() {
        // console.log("hehe: ", this.imageid);
        // console.log(this.urlimgid);
        var temp = this;
        if (this.hash) {
            axios
                .get("/image/" + this.urlimgid)
                .then(function(resp) {
                    // console.log("hi :", resp.data);
                    temp.details = resp.data[0].rows[0]; //unwrapping :C
                    temp.allcomments = resp.data[1].rows;
                    // console.log("details: ", temp.details);
                    if (temp.details === undefined) {
                        //undefined temp.details isnt an error for promise. So this is made to return an Error here
                        return throwErr;
                    }
                })
                .catch(function(err) {
                    temp.toggleImg = false;
                    // temp.click(); //close popImg
                    // console.log("err: ", err);
                });
        } else {
            axios
                .get("/image/" + this.imageid)
                .then(function(resp) {
                    temp.details = resp.data[0].rows[0]; //unwrapping :C
                    temp.allcomments = resp.data[1].rows;
                })
                .catch(err => {
                    console.log("Getting image's error: ", err);
                });
        }
    },
    //component mounted when template is triggered

    props: ["imageid", "urlimgid", "hash"],
    methods: {
        submitComment: function() {
            this.input.id = this.imageid;
            var temp2 = this;
            // console.log(this.imageid, this.input.comment, this.input.username);
            // console.log(this.input);
            axios.post("/comment", this.input).then(function(resp) {
                // console.log(resp.data[0]);
                temp2.allcomments.unshift(resp.data[0]);
            });
        },

        click: function() {
            this.$emit("change", this.open);
            //dollar sign to differentiate it from emit variable created by developer
            //emit event means trigger event directly without any actions like mouseover...
        }
    }
});
////////////////////////////////date filtering
