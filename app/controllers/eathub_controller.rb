require 'json'
class EathubController < ApplicationController
	include Mobylette::RespondToMobileRequests

	def index
	end

	#  call get_by_freeword method when user click search button
	#and update area is map and image list too.
	#  ex)
	# GET /shophub/get_by_freeword?key_word=xxx
	# i wont to add directive for infinit scroll.
	# maybe i think "/page" directive add.
    def get_by_freeword
		key_word = params[:key_word]
		next_start = params[:next_start]
		shops = Hotpepper.search_keyword(key_word, 15, next_start)
		set_to_results(shops)
		
		@key_word = key_word   	
    end

	# call get_by_location method when user grabbing and moving after release map, 
	# then re-search shop center of map latitude-longitude within map range
	# but update area is only map.
	# ex)
	# GET /shophub/get_by_location.json?lat=xxx&lng=xxx&range=xxx
    def get_by_location
    	lat = params[:lat]
    	lng = params[:lng]
    	next_start = params[:next_start]
    	shops = Hotpepper.search_location(lat, lng, next_start);
    	set_to_results(shops);
    end

    private
    def set_to_results(shops)
		@results_available = shops.attributes['results_available']
		@results_start = shops.attributes['results_start']
		@results_returned = shops.attributes['results_returned']
		@next_start = get_next_start

		@shops = shops.attributes['shop']
	end

	private
    def get_next_start
    	next_start = @results_returned.to_i + @results_start.to_i
		if next_start < @results_available.to_i
			return next_start
		else
			return -1
		end
	end

end
