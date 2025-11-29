const affiliatePartnerModel = require("../models/affiliatePartnerModels");

// Vis registrerings-siden
function getRegisterPage(req, res) {
  res.render("affiliateRegister", { 
    title: "Opret Affiliate Partner Konto",
    error: null 
  });
}

// Håndter registrering
async function register(req, res) {
  try {
    const { name, email, password, website_url } = req.body;
    
    // Validering
    if (!name || !email || !password || !website_url) {
      return res.render("affiliateRegister", {
        title: "Opret Affiliate Partner Konto",
        error: "Alle felter skal udfyldes"
      });
    }
    
    // Email validering
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render("affiliateRegister", {
        title: "Opret Affiliate Partner Konto",
        error: "Ugyldig email adresse"
      });
    }
    
    // Password længde
    if (password.length < 6) {
      return res.render("affiliateRegister", {
        title: "Opret Affiliate Partner Konto",
        error: "Adgangskoden skal være mindst 6 tegn"
      });
    }
    
    // Registrer bruger
    const newPartner = await affiliatePartnerModel.registerAffiliatePartner({
      name,
      email,
      password,
      website_url
    });
    
    // Log brugeren ind automatisk efter registrering
    req.session.affiliatePartner = newPartner;
    
    // Redirect til dashboard
    res.redirect("/affiliate/dashboard");
  } catch (err) {
    res.render("affiliateRegister", {
      title: "Opret Affiliate Partner Konto",
      error: err.message
    });
  }
}

// Vis login-siden
function getLoginPage(req, res) {
  // Hvis allerede logget ind, redirect til dashboard
  if (req.session.affiliatePartner) {
    return res.redirect("/affiliate/dashboard");
  }
  
  res.render("affiliateLogin", { 
    title: "Affiliate Partner Login",
    error: null 
  });
}

// Håndter login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Validering
    if (!email || !password) {
      return res.render("affiliateLogin", {
        title: "Affiliate Partner Login",
        error: "Email og adgangskode skal udfyldes"
      });
    }
    
    // Login bruger
    const partner = await affiliatePartnerModel.loginAffiliatePartner(email, password);
    
    // Gem i session
    req.session.affiliatePartner = partner;
    
    // Redirect til dashboard
    res.redirect("/affiliate/dashboard");
  } catch (err) {
    res.render("affiliateLogin", {
      title: "Affiliate Partner Login",
      error: err.message
    });
  }
}

// Håndter logout
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Fejl ved logout:", err);
    }
    res.redirect("/affiliate/login");
  });
}

// Vis dashboard (placeholder - bygges senere)
function getDashboard(req, res) {
  if (!req.session.affiliatePartner) {
    return res.redirect("/affiliate/login");
  }
  
  res.render("affiliateDashboard", {
    title: "Dashboard",
    partner: req.session.affiliatePartner
  });
}

module.exports = {
  getRegisterPage,
  register,
  getLoginPage,
  login,
  logout,
  getDashboard,
};

