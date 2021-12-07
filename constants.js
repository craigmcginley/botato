module.exports = {
  rejectionReasons: [
    {
      label: 'Incorrect server',
      description: 'Character is not on "Live-1" server.',
      explanation: 'Your character is not on the "Live-1" server. You can create a Warden character on that server and apply for verification again.',
      value: 'incorrect-server',
    },
    {
      label: 'Not a Warden',
      description: 'Character is not a member of the Warden faction.',
      explanation: 'SPUD is a Warden faction regiment, and your character is not a member of the Wardens.',
      value: 'not-warden',
    },
    {
      label: 'Insufficient time played',
      description: 'Insufficient time played.',
      explanation: 'You must play for a minimum of 1 hour as a Warden in order to be verified. Please play for over 1 hour and apply for verification again.',
      value: 'insufficient-time',
    },
    {
      label: 'Server nickname mismatch',
      description: 'The player\'s nickname in The Dawg House server does not match their steam name in game.',
      explanation: 'Your nickname in The Dawg House server does not match your in game name. You can right click your own name in the server and click "edit server profile" to adjust your nickname. You can apply for verification again once this is done.',
      value: 'name-mismatch',
    },
    {
      label: 'Other',
      description: 'You will DM the player with the reason they failed verification.',
      explanation: 'Your verification did not meet one of our criteria. A SPUD officer will DM you with further details.',
      value: 'other',
    },
  ]
};
