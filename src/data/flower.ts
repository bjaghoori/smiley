export default {
  "type": "Sequence",
  "statements": [
    {
      "type": "Repeat",
      "times": 8,
      "statement": {
        "type": "Sequence",
        "statements": [
	      {
	        "type": "Forward",
		    "amount": 5
	      },
          {
            "type": "Turn",
            "angle": 45
          },
          {
            "type": "Repeat",
            "times": 18,
            "statement": {
              "type": "Sequence",
              "statements": [
                {
                  "type": "Forward",
                  "amount": 5
                },
                {
                  "type": "Turn",
                  "angle": 20
                }
              ]
            }
          }
        ]
      }
    }
  ]
}