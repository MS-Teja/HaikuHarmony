const pinataSDK = require('@pinata/sdk');
const axios = require('axios');

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const pinataGateway = process.env.PINATA_GATEWAY;
const IMAGE_MAP_CID = 'QmbVtDZJJrKyFAtGRzJPXayDkVecayQCKq8QCMeEghP6vZ'; // CID of your imageMap.json

exports.handler = async (event) => {
  const { id } = event.queryStringParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Haiku ID is required' })
    };
  }

  try {
    // Fetch the image map
    const imageMapResponse = await axios.get(`https://${pinataGateway}/ipfs/${IMAGE_MAP_CID}`);
    const imageMap = imageMapResponse.data;

    console.log('Fetched image map:', imageMap);

    // Fetch the haiku data
    const response = await axios.get(`https://${pinataGateway}/ipfs/${id}`);
    const haikuData = response.data;

    console.log('Raw haiku data:', haikuData);

    // Map the numeric image identifier to an IPFS hash
    const imageHash = imageMap[haikuData.image] || haikuData.image;

    const haiku = {
      id,
      text: haikuData.text,
      image: imageHash,
      timestamp: haikuData.timestamp,
      userId: haikuData.userId,
      photoURL: haikuData.photoURL,
      displayName: haikuData.displayName,
      tags: haikuData.tags ? haikuData.tags.split(',') : [],
      likes: parseInt(haikuData.likes) || 0
    };

    console.log('Processed haiku:', haiku);
    console.log('Pinata Gateway:', pinataGateway);

    return {
      statusCode: 200,
      body: JSON.stringify({ haiku, pinataGateway })
    };

  } catch (error) {
    console.error('Error fetching haiku or image map:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch haiku or image map', details: error.message })
    };
  }
};