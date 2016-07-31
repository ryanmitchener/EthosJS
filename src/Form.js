(function() {
    EthosJS.formToJSON = function(element) {
        if (typeof element === "string") {
            element = document.querySelector(element);
        }
        var fields = element.querySelectorAll("input,select,textarea");
        var data = {};
        for (var i=0, l=fields.length; i < l; i++) {
            var field = fields[i];
            if (field.tagName === "INPUT") {
                var type = field.getAttribute("type");
                if (type === "checkbox") {
                	setValue(data, field.name, field.checked);
                } else if (type === "radio") {
                	if (field.checked) {
						setValue(data, field.name, field.value);
                	}
                } else {
                    setValue(data, field.name, field.value);
                }
            } else if (field.tagName === "SELECT") {
                setValue(data, field.name, field.value);
            } else if (field.tagName === "TEXTAREA") {
                setValue(data, field.name, field.value);
            }
        }
        return data;
    }


    // Set the value of an object based on string key (supports nested objects)
    function setValue(obj, key, value) {
        var prefixes = key.split(".");
        var current = obj;

        for (var i=0, l=prefixes.length; i < l; i++) {
            if (i === prefixes.length - 1) {
            	current[prefixes[i]] = value;
            	return;
            } else if (current[prefixes[i]] === undefined) {
                current[prefixes[i]] = {};
            };
            current = current[prefixes[i]];
        }
    }
})();