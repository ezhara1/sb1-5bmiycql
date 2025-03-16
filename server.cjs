const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Allow everything
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*'
}));

// Direct server endpoints that make the API calls
app.get('/api/thetadata/*', async (req, res) => {
  try {
    const path = req.path.replace('/api/thetadata/', '');
    const params = new URLSearchParams(req.query).toString();
    const url = `http://localhost:25510/${path}${params ? '?' + params : ''}`;
    
    console.log('\n=== ThetaData Request ===');
    console.log('Original path:', req.path);
    console.log('Processed path:', path);
    console.log('Full URL:', url);
    console.log('Query params:', req.query);
    
    // Handle special cases for options endpoints
    if (path === 'list/expirations') {
      console.log('Handling expirations request');
      // Format the response for expirations
      const response = await axios.get(url);
      console.log('Raw ThetaData response:', response.data);
      
      // Check if response has the expected structure
      if (!response.data || !response.data.response || !Array.isArray(response.data.response)) {
        console.error('Invalid response format from ThetaData API:', response.data);
        throw new Error('Invalid response format from ThetaData API');
      }

      const expirationDates = response.data.response;
      console.log('Expiration dates from ThetaData:', expirationDates);

      // Get current date and date 6 months ago
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const currentDate = parseInt(today.getFullYear() + 
                                 String(today.getMonth() + 1).padStart(2, '0') + 
                                 String(today.getDate()).padStart(2, '0'));
      
      const sixMonthsAgoDate = parseInt(sixMonthsAgo.getFullYear() + 
                                      String(sixMonthsAgo.getMonth() + 1).padStart(2, '0') + 
                                      String(sixMonthsAgo.getDate()).padStart(2, '0'));

      // Format dates to YYYY-MM-DD format and filter dates within 6 month range
      const formattedExpirations = expirationDates
        .filter(exp => exp >= sixMonthsAgoDate) // Include dates from 6 months ago
        .map(exp => {
          const expStr = exp.toString().padStart(8, '0');
          const year = expStr.slice(0, 4);
          const month = expStr.slice(4, 6);
          const day = expStr.slice(6, 8);
          return `${year}-${month}-${day}`;
        })
        .sort();
      
      console.log('Final formatted expirations:', formattedExpirations);

      // Send the formatted dates directly (not wrapped in an object)
      res.json(formattedExpirations);
    } else if (path === 'list/strikes') {
      console.log('Handling strikes request');
      // Format the response for strikes
      const response = await axios.get(url);
      console.log('Raw ThetaData response:', response.data);
      
      // Check if response has the expected structure
      if (!response.data || !response.data.response || !Array.isArray(response.data.response)) {
        console.error('Invalid response format from ThetaData API:', response.data);
        throw new Error('Invalid response format from ThetaData API');
      }

      const strikes = response.data.response;
      console.log('Strikes from ThetaData:', strikes);

      // Convert strikes from integer (170000) to decimal (170.00)
      const formattedStrikes = strikes
        .map(strike => strike / 1000)
        .sort((a, b) => a - b);

      console.log('Final formatted strikes:', formattedStrikes);
      res.json(formattedStrikes);
    } else if (path === 'v2/hist/option/eod') {
      console.log('Handling option price request with params:', {
        root: req.query.root,
        exp: req.query.exp,
        strike: req.query.strike,
        right: req.query.right,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      });
      
      // Format dates by removing dashes
      const formattedExp = req.query.exp.replace(/-/g, '');

      // Format right (call/put to C/P)
      const formattedRight = req.query.right.toLowerCase() === 'call' ? 'C' : 'P';

      // Build URL with all parameters
      const params = new URLSearchParams({
        root: req.query.root,
        exp: formattedExp,
        strike: req.query.strike, // Strike is already formatted on client side
        right: formattedRight,
        ...(req.query.start_date && { start_date: req.query.start_date }),
        ...(req.query.end_date && { end_date: req.query.end_date })
      });

      url = `http://localhost:25510/${path}?${params.toString()}`;
      console.log('Final ThetaData URL:', url);
      
      // Format the response for option data
      const response = await axios.get(url);
      console.log('Raw ThetaData response:', response.data);
      
      // Check if response has the expected structure
      if (!response.data || !response.data.response || !Array.isArray(response.data.response)) {
        console.error('Invalid response format from ThetaData API:', response.data);
        throw new Error('Invalid response format from ThetaData API');
      }

      const options = response.data.response;
      console.log('Options from ThetaData:', options);

      if (options.length === 0) {
        console.log('No option data available');
        res.json({
          lastPrice: 0,
          volume: 0,
          openInterest: 0
        });
        return;
      }

      // Get the most recent data point
      const latestOption = options[options.length - 1];
      const result = {
        lastPrice: latestOption.close || 0,
        volume: latestOption.volume || 0,
        openInterest: latestOption.open_interest || 0
      };

      console.log('Final formatted option data:', result);
      res.json(result);
    } else if (path === 'list') {
      console.log('Handling option data request');
      // Format the response for option data
      const response = await axios.get(url);
      console.log('Raw ThetaData response:', response.data);
      
      if (!response.data || !response.data.response) {
        console.error('Invalid response format from ThetaData API:', response.data);
        throw new Error('Invalid response format from ThetaData API');
      }

      const options = response.data.response;
      if (!Array.isArray(options) || options.length === 0) {
        console.error('No option data available:', options);
        throw new Error('No option data available');
      }

      const option = options[0];
      const result = {
        lastPrice: option.close || 0,
        volume: option.volume || 0,
        openInterest: option.open_interest || 0
      };
      
      console.log('Final formatted option data:', result);
      res.json(result);
    } else {
      // Default handling for other endpoints
      const response = await axios.get(url);
      console.log('Raw ThetaData response:', response.data);
      res.json(response.data);
    }
  } catch (error) {
    console.error('\n=== ThetaData Error ===');
    console.error('Error message:', error.message);
    console.error('Request URL:', error.config?.url);
    console.error('Request params:', error.config?.params);
    console.error('Response data:', error.response?.data);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data
    });
  }
});

app.get('/api/yahoo/*', async (req, res) => {
  try {
    const path = req.path.replace('/api/yahoo/', '');
    const params = new URLSearchParams(req.query).toString();
    const url = `https://query1.finance.yahoo.com/${path}${params ? '?' + params : ''}`;
    
    const response = await axios.get(url);
    console.log('Raw Yahoo response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
