Mindless::Application.routes.draw do
  namespace :api do
    namespace :v1 do
      root :to => "application#ping"
      resources :notes
      get "ping" => "application#ping"
    end
  end
end
