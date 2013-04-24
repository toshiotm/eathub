json.counts @results_available
json.start @results_start
json.returned @results_returned
json.next_start @next_start
json.shops @shops do |shop|
	json.(shop, :name)
	json.(shop.photo.pc, :m)
	json.(shop.urls, :pc)
	json.(shop, :lat)
	json.(shop, :lng)
end