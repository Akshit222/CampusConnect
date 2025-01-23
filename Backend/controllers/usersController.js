const User = require("../model/userModel");
const bcrypt = require("bcrypt"); // Correct package name

module.exports.register = async (req, resp, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if username already exists
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) 
      return resp.json({ msg: "Username already used", status: false });
    
    // Check if email already exists
    const emailCheck = await User.findOne({ email });
    if (emailCheck) 
      return resp.json({ msg: "Email already used", status: false });
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    // Exclude password from the response
    delete user.password;
    return resp.json({ status: true, user });
  } catch (ex) {
    // Pass error to the next middleware
    next(ex);
  }
};

module.exports.login = async (req, resp, next) => {
    try {
      const { username, password } = req.body;
      
      // Check if username exists
      const user = await User.findOne({ username });
      if (!user) 
        return resp.json({ msg: "Incorrect Username or password", status: false });
      
      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) 
        return resp.json({ msg: "Incorrect Username or password", status: false });
      
      // Exclude password from the response
      delete user.password;
      return resp.json({ status: true, user });
    } catch (ex) {
      next(ex);
    }
};
