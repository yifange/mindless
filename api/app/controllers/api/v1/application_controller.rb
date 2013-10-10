class Api::V1::ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session
  rescue_from ActiveRecord::RecordNotFound, :with => :record_not_found
  def ping
    render :text => "Pong!<br/>Mindless backend api v1 is running."
  end

  private

  #http://stackoverflow.com/questions/14734243/rails-csrf-protection-angular-js-protect-from-forgery-makes-me-to-log-out-on
  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end

  def verified_request?
    super || form_authenticity_token == request.headers['HTTP_X_XSRF_TOKEN']
  end

  #http://stackoverflow.com/questions/11859437/how-to-handle-exceptions-in-json-based-restful-code
  def record_not_found
    render :text => "Record not found", :status => :not_found

  end
end
