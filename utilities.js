function getJSON(url) {
	var request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
	var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
	var responseObject = [NSJSONSerialization JSONObjectWithData: response options: nil error: nil];
	return responseObject;
}

function createSelect(msg, items, selectedItemIndex){
  selectedItemIndex = selectedItemIndex || 0

  var accessory = [[NSComboBox alloc] initWithFrame:NSMakeRect(0,0,200,25)]
  [accessory addItemsWithObjectValues:items]
  [accessory selectItemAtIndex:selectedItemIndex]

  var alert = [[NSAlert alloc] init]
  [alert setMessageText:msg]
  [alert addButtonWithTitle:'OK']
  [alert addButtonWithTitle:'Cancel']
  [alert setAccessoryView:accessory]

  var responseCode = [alert runModal]
  var sel = [accessory indexOfSelectedItem]

  return sel
}
