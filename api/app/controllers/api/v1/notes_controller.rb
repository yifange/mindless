class Api::V1::NotesController < Api::V1::ApplicationController

  def index
    render :json => Note.all.order("updated_at DESC")
  end

  def show
    render :json => Note.find(params[:id])
  end
  
  def create
    note = Note.new(note_params)
    if note.save
      render :json => note, :status => :created
    else
      render :json => note.errors, :status => :unprocessable_entity
    end
  end

  def update
    note = Note.find(params[:id])
    if note.update_attributes(note_params)
      render :json => true, :head => :no_content
    else
      render :json => note.errors, :status => :unprocessable_entity
    end
  end

  def destroy
    Note.find(params[:id]).destroy
    render :json => true, :head => :no_content
  end

  private
  def note_params
    params.require(:note).permit(:title, :content)
  end
end
