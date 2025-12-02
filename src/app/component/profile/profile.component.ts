import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: any = null;
  isEditMode = false;
  isLoading = false;
  activeTab = 'profile';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      profileImage: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.profileForm.patchValue({
          name: this.user.name,
          email: this.user.email,
          profileImage: this.user.profileImage || ''
        });
        this.imagePreview = this.user.profileImage || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastr.error('Failed to load profile', 'Error');
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Reset form to original values
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        profileImage: this.user.profileImage || ''
      });
      this.imagePreview = this.user.profileImage || null;
      this.selectedFile = null;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.profileForm.patchValue({ profileImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { name, email, profileImage } = this.profileForm.value;

    this.authService.updateProfile(name, email, profileImage).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.isEditMode = false;
        this.isLoading = false;
        this.selectedFile = null;
        this.toastr.success('Profile updated successfully!', 'Success');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.toastr.error(error.error?.message || 'Failed to update profile', 'Error');
        this.isLoading = false;
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordForm.errors?.['passwordMismatch']) {
      this.toastr.error('New passwords do not match', 'Error');
      return;
    }

    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        this.passwordForm.reset();
        this.isLoading = false;
        this.toastr.success('Password changed successfully!', 'Success');
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.toastr.error(error.error?.message || 'Failed to change password', 'Error');
        this.isLoading = false;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  get pf() {
    return this.profileForm.controls;
  }

  get pwf() {
    return this.passwordForm.controls;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
