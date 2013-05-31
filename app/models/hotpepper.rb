class Hotpepper < ActiveResource::Base
	require 'multi_json'

	self.site = "http://webservice.recruit.co.jp"
	self.format = :json

	API_KEY = 	"7b2c7f5d7c4cdff6"
	HOTPEPPER_PATH = "/hotpepper/gourmet/v1/"

	def self.search_location(lat, lng, start=1)
		self.find(
			:one,
			:from => HOTPEPPER_PATH,
			:params => {
				:key => "#{API_KEY}",
				:lat => "#{lat}",
				:lng => "#{lng}",
				:start => "#{start}",
				:format => "json"
				})
	end

	def self.search_keyword(key_word, count=10, start=1)
		self.find(
			:one,
			:from => HOTPEPPER_PATH,
			:params => {
				:key => "#{API_KEY}",				
				:keyword => "#{key_word}",
				:count => "#{count}",
				:start => "#{start}",
				:format => "json"
			})
	end
end