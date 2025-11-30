const affiliatePartnerModel = require("../models/affiliatePartnerModels");
const experienceModel = require("../models/experienceModels");
const bookingModel = require("../models/bookingModels");

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

// Vis dashboard
async function getDashboard(req, res) {
  if (!req.session.affiliatePartner) {
    return res.redirect("/affiliate/login");
  }
  
  try {
    const experiences = await experienceModel.getExperiencesByPartnerId(req.session.affiliatePartner.id);
    const statistics = await bookingModel.getPartnerStatistics(req.session.affiliatePartner.id);
    const bookings = await bookingModel.getBookingsByPartner(req.session.affiliatePartner.id);
    
    res.render("affiliateDashboard", {
      title: "Dashboard",
      partner: req.session.affiliatePartner,
      experiences: experiences || [],
      bookings: bookings || [],
      statistics: statistics,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error("Fejl ved hentning af experiences:", err);
    res.render("affiliateDashboard", {
      title: "Dashboard",
      partner: req.session.affiliatePartner,
      experiences: [],
      bookings: [],
      statistics: { activeExperiences: 0, totalBookings: 0, totalRevenue: 0 },
      success: null,
      error: null
    });
  }
}

// Vis liste over affiliate partners experiences (redirecter nu til dashboard)
async function getExperiences(req, res) {
  if (!req.session.affiliatePartner) {
    return res.redirect("/affiliate/login");
  }
  
  // Redirect til dashboard i stedet - alle oplevelser vises der nu
  res.redirect("/affiliate/dashboard");
}

// Vis formular til at oprette ny experience
function getCreateExperiencePage(req, res) {
  if (!req.session.affiliatePartner) {
    return res.redirect("/affiliate/login");
  }
  
  res.render("affiliateCreateExperience", {
    title: "Opret Ny Oplevelse",
    partner: req.session.affiliatePartner,
    error: null
  });
}

// Håndter oprettelse af ny experience
async function createExperience(req, res) {
  if (!req.session.affiliatePartner) {
    return res.redirect("/affiliate/login");
  }
  
  try {
    const {
      title,
      description,
      location,
      duration_hours,
      price_from,
      category,
      image_url,
      date_type,
      single_date,
      multiple_dates
    } = req.body;
    
    // Validering
    if (!title || !description || !location || !duration_hours || !price_from || !category || !date_type) {
      return res.render("affiliateCreateExperience", {
        title: "Opret Ny Oplevelse",
        partner: req.session.affiliatePartner,
        error: "Alle obligatoriske felter skal udfyldes"
      });
    }
    
    // Håndter available_dates baseret på date_type
    let available_dates = null;
    if (date_type === "single" && single_date) {
      available_dates = JSON.stringify({ type: "single", date: single_date });
    } else if (date_type === "multiple" && multiple_dates) {
      // Split komma-separerede datoer
      const dates = multiple_dates.split(",").map(d => d.trim()).filter(d => d);
      available_dates = JSON.stringify({ type: "multiple", dates: dates });
    } else if (date_type === "always") {
      available_dates = JSON.stringify({ type: "always" });
    }
    
    // Opret experience
    const result = await experienceModel.createExperience({
      title,
      description,
      location,
      duration_hours: parseFloat(duration_hours),
      price_from: parseFloat(price_from),
      category,
      image_url: image_url || null,
      affiliate_partner_id: req.session.affiliatePartner.id,
      available_dates: available_dates,
      status: "active"
    });
    
    console.log("Experience oprettet:", result);
    
    // Redirect til dashboard med success besked
    res.redirect("/affiliate/dashboard?success=Oplevelsen er oprettet!");
  } catch (err) {
    console.error("Fejl ved oprettelse af experience:", err);
    res.render("affiliateCreateExperience", {
      title: "Opret Ny Oplevelse",
      partner: req.session.affiliatePartner,
      error: err.message
    });
  }
}

// Vis edit experience page
async function getEditExperiencePage(req, res) {
  if (!req.session.affiliatePartner) {
    return res.redirect("/affiliate/login");
  }
  
  try {
    const experienceId = req.params.id;
    const experience = await experienceModel.getExperienceById(experienceId);
    
    if (!experience || experience.affiliate_partner_id !== req.session.affiliatePartner.id) {
      return res.redirect("/affiliate/dashboard?error=Du har ikke adgang til denne oplevelse");
    }
    
    res.render("affiliateEditExperience", {
      title: "Rediger Oplevelse",
      partner: req.session.affiliatePartner,
      experience: experience,
      error: null
    });
  } catch (err) {
    console.error("Fejl ved hentning af experience:", err);
    res.redirect("/affiliate/dashboard?error=Kunne ikke hente oplevelsen");
  }
}

// Opdater en experience
async function updateExperience(req, res) {
  if (!req.session.affiliatePartner) {
    return res.redirect("/affiliate/login");
  }
  
  try {
    const experienceId = req.params.id;
    const experience = await experienceModel.getExperienceById(experienceId);
    
    if (!experience || experience.affiliate_partner_id !== req.session.affiliatePartner.id) {
      return res.redirect("/affiliate/dashboard?error=Du har ikke adgang til denne oplevelse");
    }
    
    const {
      title,
      description,
      location,
      duration_hours,
      price_from,
      category,
      image_url,
      date_type,
      single_date,
      multiple_dates
    } = req.body;
    
    // Validering
    if (!title || !description || !location || !duration_hours || !price_from || !category || !date_type) {
      return res.render("affiliateEditExperience", {
        title: "Rediger Oplevelse",
        partner: req.session.affiliatePartner,
        experience: experience,
        error: "Alle obligatoriske felter skal udfyldes"
      });
    }
    
    // Håndter available_dates
    let available_dates = experience.available_dates; // Behold eksisterende hvis ikke ændret
    if (date_type === "single" && single_date) {
      available_dates = JSON.stringify({ type: "single", date: single_date });
    } else if (date_type === "multiple" && multiple_dates) {
      const dates = multiple_dates.split(",").map(d => d.trim()).filter(d => d);
      available_dates = JSON.stringify({ type: "multiple", dates: dates });
    } else if (date_type === "always") {
      available_dates = JSON.stringify({ type: "always" });
    }
    
    // Opdater experience
    await experienceModel.updateExperience(experienceId, {
      title,
      description,
      location,
      duration_hours: parseFloat(duration_hours),
      price_from: parseFloat(price_from),
      category,
      image_url: image_url || experience.image_url,
      available_dates: available_dates,
      status: "active"
    });
    
    res.redirect("/affiliate/dashboard?success=Oplevelsen er opdateret!");
  } catch (err) {
    console.error("Fejl ved opdatering af experience:", err);
    const experience = await experienceModel.getExperienceById(req.params.id);
    res.render("affiliateEditExperience", {
      title: "Rediger Oplevelse",
      partner: req.session.affiliatePartner,
      experience: experience,
      error: err.message
    });
  }
}

// Slet en experience
async function deleteExperience(req, res) {
  if (!req.session.affiliatePartner) {
    return res.redirect("/affiliate/login");
  }
  
  try {
    const experienceId = req.params.id;
    
    // Tjek at experience tilhører denne partner
    const experience = await experienceModel.getExperienceById(experienceId);
    if (!experience || experience.affiliate_partner_id !== req.session.affiliatePartner.id) {
      return res.redirect("/affiliate/dashboard?error=Du har ikke adgang til denne oplevelse");
    }
    
    await experienceModel.deleteExperience(experienceId);
    res.redirect("/affiliate/dashboard?success=Oplevelsen er slettet");
  } catch (err) {
    console.error("Fejl ved sletning af experience:", err);
    res.redirect("/affiliate/dashboard?error=Kunne ikke slette oplevelsen");
  }
}

module.exports = {
  getRegisterPage,
  register,
  getLoginPage,
  login,
  logout,
  getDashboard,
  getExperiences,
  getCreateExperiencePage,
  createExperience,
  getEditExperiencePage,
  updateExperience,
  deleteExperience,
};

