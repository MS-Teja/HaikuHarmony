const pinataSDK = require('@pinata/sdk');
const axios = require('axios');

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const pinataGateway = process.env.PINATA_GATEWAY;
const IMAGE_MAP_CID = 'QmbVtDZJJrKyFAtGRzJPXayDkVecayQCKq8QCMeEghP6vZ';

exports.handler = async (event) => {
  const { tags } = event.queryStringParameters;

  if (!tags) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Tags are required for search' })
    };
  }

  try {
    const imageMapResponse = await axios.get(`https://${pinataGateway}/ipfs/${IMAGE_MAP_CID}`);
    const imageMap = imageMapResponse.data;

    const pinList = await pinata.pinList({
      status: 'pinned',
      metadata: { name: 'haiku_metadata.json' }
    });

    const searchTags = tags.toLowerCase().split(',').map(tag => tag.trim());

    const matchingHaikus = await Promise.all(pinList.rows.map(async (pin) => {
      const response = await axios.get(`https://${pinataGateway}/ipfs/${pin.ipfs_pin_hash}`);
      const haikuData = response.data;

      // Handle different possible formats of tags
      let haikuTags = [];
      if (Array.isArray(haikuData.tags)) {
        haikuTags = haikuData.tags.map(tag => tag.toLowerCase());
      } else if (typeof haikuData.tags === 'string') {
        haikuTags = haikuData.tags.toLowerCase().split(',').map(tag => tag.trim());
      }

      if (searchTags.some(tag => haikuTags.includes(tag))) {
        return {
          id: pin.ipfs_pin_hash,
          text: haikuData.text,
          image: imageMap[haikuData.image] || haikuData.image,
          timestamp: haikuData.timestamp,
          userId: haikuData.userId,
          displayName: haikuData.displayName,
          photoURL: haikuData.photoURL,
          tags: haikuTags,
          likes: haikuData.likes || 0
        };
      }
      return null;
    }));

    const filteredHaikus = matchingHaikus.filter(haiku => haiku !== null)
      .sort((a, b) => b.timestamp - a.timestamp);

    console.log(`Found ${filteredHaikus.length} matching haikus`);

    return {
      statusCode: 200,
      body: JSON.stringify({ haikus: filteredHaikus, pinataGateway })
    };

  } catch (error) {
    console.error('Error searching haikus:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to search haikus', details: error.message })
    };
  }
};