const pinataSDK = require('@pinata/sdk');
const axios = require('axios');

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const pinataGateway = process.env.PINATA_GATEWAY;
const IMAGE_MAP_CID = 'QmbVtDZJJrKyFAtGRzJPXayDkVecayQCKq8QCMeEghP6vZ';

exports.handler = async (event) => {
  const { userId } = event.queryStringParameters;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'User ID is required' })
    };
  }

  try {
    // Fetch the image map
    const imageMapResponse = await axios.get(`https://${pinataGateway}/ipfs/${IMAGE_MAP_CID}`);
    const imageMap = imageMapResponse.data;

    // Fetch all haikus
    const pinList = await pinata.pinList({
      status: 'pinned',
      metadata: { name: 'haiku_metadata.json' }
    });

    const userHaikus = await Promise.all(pinList.rows.map(async (pin) => {
      const response = await axios.get(`https://${pinataGateway}/ipfs/${pin.ipfs_pin_hash}`);
      const haikuData = response.data;

      // Check if this haiku belongs to the requested user
      if (haikuData.userId !== userId) {
        return null;
      }

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

    // Filter out null values and sort by timestamp
    const filteredHaikus = userHaikus.filter(haiku => haiku !== null)
      .sort((a, b) => b.timestamp - a.timestamp);

    return {
      statusCode: 200,
      body: JSON.stringify({
        haikus: filteredHaikus,
        pinataGateway,
        displayName: filteredHaikus[0]?.displayName || 'User'
      })
    };

  } catch (error) {
    console.error('Error fetching user haikus:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch user haikus', details: error.message })
    };
  }
};