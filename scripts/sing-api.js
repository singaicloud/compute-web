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
                        const errorData = JSON.parse(xhr.responseText);
                        error.responseData = errorData;
                        
                        if (errorData.message) {
                            error.message = errorData.message;
                        }
                        
                        if (errorData.details) {
                            try {
                                const detailsObj = typeof errorData.details === 'string' ? 
                                    JSON.parse(errorData.details) : errorData.details;
                                error.details = detailsObj;
                                
                                if (detailsObj.message && !error.message.includes(detailsObj.message)) {
                                    error.message += `: ${detailsObj.message}`;
                                }
                            } catch (e) {
                                error.details = errorData.details;
                            }
                        }
                    } catch (e) {
                        error.message = `Request failed with status ${xhr.status}`;
                    }
                    
                    console.error(`API Error (${xhr.status})`, error);
                    
                    reject(error);
                }
            };
            
            xhr.onerror = function() {
                const error = new Error('Network error occurred');
                error.type = 'network_error';
                reject(error);
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
}

// read token from cookie
const token = document.cookie.split(";").find((c) => c.startsWith("token="))?.split("=")[1];
var baseUrl = window.location.hostname === "my.singaicloud.com" 
    ? "https://api.singaicloud.com" 
    : "https://api.nova.singaicloud.com";
var api = new SingAPI(token, baseUrl);