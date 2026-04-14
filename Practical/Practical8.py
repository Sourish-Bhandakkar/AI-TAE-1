isa = { 
"bird": "animal", 
"dog": "animal", 
"sparrow": "bird" 
} 
cando = { 
"bird": ["fly"], 
"dog": ["bark"] 
} 
has = { 
"animal": ["cells"] 
} 
def get_superclass(concept): 
    return isa.get(concept, None) 
def inherits_property(concept, property_name): 
    if concept in has and property_name in has[concept]: 
        return True 
    parent = get_superclass(concept) 
 
    if parent: 
        return inherits_property(parent, property_name) 
    return False 
print("Does a sparrow have cells?", inherits_property("sparrow", "cells")) 
print("Does a sparrow have wings?", inherits_property("sparrow", "wings")) 