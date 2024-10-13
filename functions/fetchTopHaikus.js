const pinataSDK = require('@pinata/sdk');
const axios = require('axios');

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const pinataGateway = process.env.PINATA_GATEWAY;
const IMAGE_MAP_CID = 'QmbVtDZJJrKyFAtGRzJPXayDkVecayQCKq8QCMeEghP6vZ'; // CID of your imageMap.json

exports.handler = async (event) => {
  try {
    // Fetch the image map
    const imageMapResponse = await axios.get(`https://${pinataGateway}/ipfs/${IMAGE_MAP_CID}`);
    const imageMap = imageMapResponse.data;

    // Fetch all haikus
    const pinList = await pinata.pinList({
      status: 'pinned',
      metadata: { name: 'haiku_metadata.json' }
    });

    // Process and sort haikus
    const haikus = await Promise.all(pinList.rows.map(async (pin) => {
      const response = await axios.get(`https://${pinataGateway}/ipfs/${pin.ipfs_pin_hash}`);
      const haikuData = response.data;

      // Map the numeric image identifier to an IPFS hash
      const imageHash = imageMap[haikuData.image] || haikuData.image;

      return {
        id: pin.ipfs_pin_hash,
        text: haikuData.text,
        image: imageHash,
        timestamp: haikuData.timestamp,
        userId: haikuData.userId,
        displayName: haikuData.displayName,
        photoURL: haikuData.photoURL,
        tags: haikuData.tags ? haikuData.tags.split(',') : [],
        likes: parseInt(haikuData.likes) || 0
      };
    }));

    // Sort haikus by likes in descending order and get the top 5
    const topHaikus = haikus
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);

    return {
      statusCode: 200,
      body: JSON.stringify({ haikus: topHaikus, pinataGateway })
    };

  } catch (error) {
    console.error('Error fetching top haikus:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch top haikus', details: error.message })
    };
  }
};