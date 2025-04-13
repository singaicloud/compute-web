class SingAPI {
    constructor(token, baseUrl="https://api.singaicloud.com") {
        this.baseUrl = baseUrl;
        this.token = token;
    }
    updateToken(token) {
        this.token = token;
    }
    async fetch(path, data, headers, options, redirect = true) {
        const url = `${this.baseUrl}${path}`;
        if (this.token) {       
            headers["Authorization"] = `Bearer ${this.token}`;
        }
        var response;
        if (data) {
            response = await fetch(url, { ...options, headers, body: data });
        } else {
            response = await fetch(url, { ...options, headers });
        }
        if (response.status === 401) {
            if (redirect) {
                window.location.href = "/login.html";
            };
            return;
        }
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }
    get(path, options = {}) {
        return this.fetch(path, null, {}, {...options, method: "GET" });
    }
    post(path, data, options = {}) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.baseUrl + path, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            if (this.token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
            }
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        resolve(xhr.responseText);
                    }
                } else {
                    const error = new Error('request failed');
                    error.status = xhr.status;
                    error.response = xhr.responseText;
                    
                    try {
                        error.responseData = JSON.parse(xhr.responseText);
                    } catch (e) {
                    }
                    
                    reject(error);
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('network error'));
            };
            
            xhr.send(JSON.stringify(data));
        });
    }
    postForm(path, data, options = {}) {
        return this.fetch(path, data, {}, {...options, method: "POST" });
    }
    download(path) {
        const url = `${this.baseUrl}${path}`;
        var headers = {};
        headers["Authorization"] = `Bearer ${this.token}`;
        fetch(url, {method: "GET", headers})
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();  // Get the response as a blob
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = path.split("/").pop();
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url); // Clean up the URL
        })
        .catch(error => {
          console.error(error);
        });

    }
    async login(username, password) {
        const response = await this.fetch("/login", 
            JSON.stringify({hash: username, password}),
            {"Content-Type": "application/json"},
            {method: "POST"},
            false,
        );
        if (response && response.token) {
            this.updateToken(response.token);
            // set cookie with 1 year expiration
            document.cookie = `token=${response.token};max-age=31536000;path=/`;
            return true;
        } 
        return false;
    }

    async signup(username, password, firstName, lastName, inviteCode, testMode = true){
        if(!username || !password || !firstName || !lastName || !inviteCode){
            return{
                success: false,
                error: "All fields are required"
            }
        }
        if(password.length < 8){
            return{
                success: false,
                error: "Password must be at least 8 characters"
            }
        }
        ``
        try{
            const response = await this.post("/create_user",{
                username,
                password,
                first_name: firstName,
                last_name: lastName,
                invite_code: inviteCode,
                test: testMode
            });
            return{
                success: true,
                data: response
            }
        }catch(error){
            console.error("Signup error: ", error);
            let errorMessage = "Signup failed"
            if(error.responseData && error.responseData.error){
                errorMessage = error.responseData.error;
            }else if (error.response){
                try {
                    const errorData = JSON.parse(error.response);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = error.response;
                }
                }
                return{
                    success: false,
                    error: errorMessage
                }
    
        }

    }
}

// read token from cookie
const token = document.cookie.split(";").find((c) => c.startsWith("token="))?.split("=")[1];
var baseUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080/api"  // For local development with proxy
    : window.location.hostname === "my.singaicloud.com"
        ? "https://api.singaicloud.com"
        : "https://api.nova.singaicloud.com";
var api = new SingAPI(token, baseUrl);