#  **Vehicle Service Management System (VSMS)**

Live: https://vehicle-service-management-system-drab.vercel.app/

##  **Demo Credentials**

Use the following accounts to explore different roles:

###  **Admin**
- **Email:** admin@test.com  
- **Password:** 123456  

###  **Security**
- **Email:** security1@test.com  
- **Email:** security2@test.com  
- **Password:** 123456  

###  **Reception**
- **Email:** reception1@test.com  
- **Email:** reception2@test.com  
- **Password:** 123456  

###  **Advisor**
- **Email:** advisor1@test.com  
- **Email:** advisor2@test.com  
- **Password:** 123456  

**A MERN stack web application** built to digitize and streamline operations of a vehicle service center.  
The system manages the **complete lifecycle of a vehicle — from entry to delivery — using role-based workflows.**

---

##  **Overview**

VSMS simulates real-world service center operations by introducing **4 operational roles**:

- **Security**
- **Reception**
- **Advisor**
- **Admin**

Each role has **controlled responsibilities**, ensuring a **structured and trackable service pipeline.**

---

##  **Workflow**

###  **Security**
- First point of contact  
- Records **basic vehicle & customer details**  
- Moves vehicle entry to **Reception**  

###  **Reception**
- Assigns **Service Advisor**  
- Manages **delivery approval**  
- Can assign **rework** if service is unsatisfactory  

###  **Advisor**
- Inspects vehicle  
- Adds **detailed service information**  
- Generates **estimated cost**  
- Uploads **job card (via Cloudinary)**  

###  **Admin**
- Monitors **all vehicles and their statuses**  
- Visualizes data using **charts**  
- Manages **application users and roles**  

---

##  **Key Features**

-  **Role-Based Access Control (RBAC)**  
-  **End-to-End Vehicle Tracking**  
-  **Job Card Upload & Management (Cloudinary)**  
-  **Admin Dashboard with Analytics**  
-  **Rework Handling System**  
-  **Real-time Service Status Updates**  

---

##  **Tech Stack**

###  **Frontend**
- **React.js**  
- **TypeScript**  

###  **Backend**
- **Node.js**  
- **Express.js**  

###  **Database**
- **MongoDB Atlas**  

###  **Cloud & Deployment**
- **Vercel** (Frontend)  
- **Render** (Backend)  
- **Cloudinary** (Job Card Storage)  
