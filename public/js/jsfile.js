//////without refreshing or reloading
(function() {
    //window.apa =
    new Vue({
        el: "#main",
        data: {
            images: [],
            form: { title: "", description: "", username: "", file: null },
            popImg: false,
            currID: null,
            notLastImg: true,
            urlImgId: location.hash.slice(1),
            //this line is needed to handle user copy-paste the #num url on the next blank page. Hashchange event isnt triggered. So a default value is given.
            onHashNum: null,
            displayUpload: false,
            readyUpload: false,
            inputErrMsg: false
        },
        mounted: function() {
            var app = this;

            axios.get("/images").then(function(resp) {
                // console.log(resp.data);
                app.images = resp.data;
            });
            window.addEventListener("hashchange", function() {
                app.urlImgId = location.hash.slice(1); //database handles number-like string too!
                app.popImg = true;
                app.onHashNum = true;
                // console.log(typeof app.urlImgId); //string
                // console.log(typeof +app.urlImgId); //number
            });
            //use window global object instead of document because window measuring the whole page including url part and document measuring from white page after url
            if (location.hash.slice(1)) {
                app.onHashNum = true;
                app.popImg = true; //to handle user inserts #num url from the beginning(or copy-paste the #num url on the next blank page)
            }
        },
        //OR then(function(resp) {
        //     this.cities = resp.data;
        // }).bind(this);

        methods: {
            clickFileInput: function() {
                document.getElementById("fileUpload").click();
            },
            handleFileChange: function(e) {
                // this stores the file that was just selected in the "file" property of the data object
                // console.log(e.target.files[0]);
                this.form.file = e.target.files[0];
                this.readyUpload = true;
            },
            uploadFile: function() {
                // formData is used to send FILES to server!
                var formData = new FormData();
                formData.append("file", this.form.file);
                formData.append("username", this.form.username);
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                // logging formData gives you an empty object
                // that's ok! it's working!
                var temp = this;
                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        if (resp.data[0] === undefined) {
                            return throwErr;
                        }
                        // console.log(resp.data[0]);
                        // console.log(temp.images);
                        temp.images.unshift(resp.data[0]);
                    })
                    .catch(function(err) {
                        temp.inputErrMsg = true;
                    });

                this.displayUpload = false;
                this.readyUpload = false;
            },
            imgModal: function(e) {
                // console.log("see passed id", e);
                this.currID = e;
                this.popImg = true;
                this.onHashNum = false;
                this.inputErrMsg = false;
            },
            closeImg: function(e) {
                this.popImg = e;
            },
            loadingMoreImg: function(e) {
                // console.log(this.images);
                // console.log(this.images[this.images.length - 1].id);
                this.inputErrMsg = false;
                var temp = this;
                let last_id = this.images[this.images.length - 1].id; //last id of image of current page
                axios.post("/moreimages", { last_id }).then(function(resp) {
                    //the post body must be wrapped in object or { lastid:last_id}
                    // console.log(resp.data.rows);
                    for (let i = 0; i < resp.data.rows.length; i++) {
                        temp.images.push(resp.data.rows[i]); //same as defining var temp = this, temp....
                        if (
                            resp.data.rows[i].id == resp.data.rows[i].lowest_id
                        ) {
                            temp.notLastImg = false;
                        }
                    }
                });
            }
        }
    });
})();

//additional info
//since Vue is a constructor, we can assign it to a global var, window with a object named app:
//window.app = new vue
//this makes it easier to call out the property's values inside Vue. E.g. app.cities.name (on console)
//short-cut for v-on, @: and v-bind, :
//Arrow function cant be used here!!! on browser, only on node.js
