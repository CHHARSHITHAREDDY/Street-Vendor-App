// const jwt = require('jsonwebtoken');
// const Vendor = require('../models/Vendor');
// const Customer = require('../models/Customer');

// // General auth: attaches req.user and req.userType ('vendor' | 'customer')
// async function auth(req, res, next) {
//   try {
//     const authHeader = req.headers.authorization || '';
//     const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     // Try vendor first, then customer
//     let user = await Vendor.findById(userId);
//     if (user) {
//       req.user = user;
//       req.userType = 'vendor';
//       return next();
//     }

//     user = await Customer.findById(userId);
//     if (user) {
//       req.user = user;
//       req.userType = 'customer';
//       return next();
//     }

//     return res.status(401).json({ message: 'User not found' });
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// }

// // Require vendor
// async function vendorAuth(req, res, next) {
//   await auth(req, res, function onAuthed(err) {
//     if (err) return next(err);
//     if (req.userType !== 'vendor') {
//       return res.status(403).json({ message: 'Vendor access required' });
//     }
//     return next();
//   });
// }

// // Require customer
// async function customerAuth(req, res, next) {
//   await auth(req, res, function onAuthed(err) {
//     if (err) return next(err);
//     if (req.userType !== 'customer') {
//       return res.status(403).json({ message: 'Customer access required' });
//     }
//     return next();
//   });
// }

// module.exports = { auth, vendorAuth, customerAuth };






const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");
const Customer = require("../models/Customer");

/* ------------------------------------------------------
   SHARED AUTH LOGIC
------------------------------------------------------ */
async function authenticateToken(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) throw new Error("NO_TOKEN");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("INVALID_TOKEN");
  }

  const userId = decoded.id;

  // First check vendor
  let user = await Vendor.findById(userId);
  if (user) return { user, type: "vendor" };

  // Then customer
  user = await Customer.findById(userId);
  if (user) return { user, type: "customer" };

  throw new Error("NOT_FOUND");
}

/* ------------------------------------------------------
   GENERAL AUTH (OPTIONAL USE)
------------------------------------------------------ */
async function auth(req, res, next) {
  // Allow OPTIONS for CORS preflight
  if (req.method === "OPTIONS") return res.sendStatus(200);

  try {
    const result = await authenticateToken(req);
    req.user = result.user;
    req.userType = result.type;
    return next();
  } catch (err) {
    if (err.message === "NO_TOKEN") {
      return res.status(401).json({ message: "No token provided" });
    }
    if (err.message === "INVALID_TOKEN") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(401).json({ message: "User not found" });
  }
}

/* ------------------------------------------------------
   VENDOR AUTH ONLY
------------------------------------------------------ */
async function vendorAuth(req, res, next) {
  if (req.method === "OPTIONS") return res.sendStatus(200);

  try {
    const result = await authenticateToken(req);
    if (result.type !== "vendor") {
      return res.status(403).json({ message: "Vendor access required" });
    }
    req.user = result.user;
    req.userType = "vendor";
    next();
  } catch (err) {
    if (err.message === "NO_TOKEN") {
      return res.status(401).json({ message: "No token provided" });
    }
    if (err.message === "INVALID_TOKEN") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(401).json({ message: "User not found" });
  }
}

/* ------------------------------------------------------
   CUSTOMER AUTH ONLY
------------------------------------------------------ */
async function customerAuth(req, res, next) {
  if (req.method === "OPTIONS") return res.sendStatus(200);

  try {
    const result = await authenticateToken(req);
    if (result.type !== "customer") {
      return res.status(403).json({ message: "Customer access required" });
    }
    req.user = result.user;
    req.userType = "customer";
    next();
  } catch (err) {
    if (err.message === "NO_TOKEN") {
      return res.status(401).json({ message: "No token provided" });
    }
    if (err.message === "INVALID_TOKEN") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(401).json({ message: "User not found" });
  }
}

module.exports = { auth, vendorAuth, customerAuth };

