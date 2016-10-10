# Model Base

Model Base Utility Classes

Classes to  extend and help create useful data models with strict validation

Run Tests with `npm test`

### Example

```javascript
# /api/models/analytics.js

'use strict';

const Model = require('model-base').Model;
const ModelCollection = require('model-base').ModelCollection;

const AnalyticsAttributes = {
	id: {
		type: 'integer',
		required: true,
		description: 'analytics datum id'
	},
	metric: {
		type: 'string',
		required: true,
		description:'type of analytics datum'
	},
	value: {
		type:'float',
		required: true,
		description:'value of metric'
	}
};

class AnalyticsModel extends Model {
	constructor(values) {
		super(AnalyticsAttributes, values);
	}
}

class AnalyticsModelCollection extends ModelCollection {
	constructor(values, coerce) {
		super(AnalyticsModel, values, coerce);
	}
}

module.exports.AnalyticsModel = AnalyticsModel;
module.exports.AnalyticsAttributes = AnalyticsAttributes;
module.exports.AnalyticsCollection = AnalyticsModelCollection;
```

```javascript
# /api/controllers/analytics.js

'use strict';

let ModelFile = require(`/api/models/analytics`);
let ModelCollection = ModelFile.AnalyticsCollection;

let collection = new ModelCollection(result.rows, true);
return collection.validate().getValues(true);
```

### List Of Validation Types

```javascript
'array',
'buffer',
'string',
'boolean',
'ip',
'url',
'slug',
'uuid',
'fqdn',
'json',
'email',
'alpha',
'base64',
'hex',
'alpha_numeric',
'phone',
'function',
'date',
'time',
'datetime',
'daterange',
'timestamp',
'integer',
'float',
'number',
'object'
  ```



