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

    const pinList = await pinata.pinList({
      status: 'pinned',
      metadata: { name: 'haiku_metadata.json' }
    });

    if (pinList.rows.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ haikus: [], pinataGateway })
      };
    }

    const haikus = await Promise.all(pinList.rows.map(async (pin) => {
      try {
        const response = await axios.get(`https://${pinataGateway}/ipfs/${pin.ipfs_pin_hash}`);
        const { text, image, timestamp, userId, displayName, photoURL, tags, likes } = response.data;

        return {
          id: pin.ipfs_pin_hash,
          text,
          image: imageMap[image] || image, // Use the imageMap to get the IPFS hash, fallback to the original value
          timestamp: parseInt(timestamp),
          userId,
          displayName,
          photoURL,
          tags: tags ? tags.split(',') : [],
          likes: parseInt(likes) || 0
        };
      } catch (error) {
        console.error('Error processing pin:', pin.ipfs_pin_hash, error);
        return null;
      }
    }));

    const validHaikus = haikus.filter(haiku => haiku !== null);

    return {
      statusCode: 200,
      body: JSON.stringify({ haikus: validHaikus, pinataGateway })
    };

  } catch (error) {
    console.error('Error fetching haikus:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch haikus', details: error.message })
    };
  }
};